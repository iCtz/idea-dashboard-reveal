import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import type { Profile, User } from '@prisma/client';

const prisma = new PrismaClient();

const testUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'submitter@test.com',
    fullName: 'Test Submitter',
    role: UserRole.submitter,
    department: 'Innovation',
    is_admin: false,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'evaluator@test.com',
    fullName: 'Test Evaluator',
    role: UserRole.evaluator,
    department: 'Product',
    is_admin: false,
  },
  {
	id: '33333333-3333-3333-3333-333333333333',
    email: 'management@test.com',
    fullName: 'Test Management',
    role: UserRole.management,
    department: 'Executive',
    is_admin: false,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'test@you.com', // For the "Quick Access" button
    fullName: 'Quick Access User',
    role: UserRole.submitter,
    department: 'General',
    is_admin: false,
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    email: 'admin@test.com', // For the "Browse as Admin" button
    fullName: 'Browse Admin',
    role: UserRole.ADMIN, // Or another appropriate role
    department: 'Administration',
    is_admin: true,
    raw_user_meta: {
        "sub": "b150767f-b3ed-4585-821b-65ee24b9d129",
        "email": "admin@browse.com",
        "full_name": "Browse Admin",
        "email_verified": true,
        "phone_verified": false
    },
    raw_app_meta: {
        "provider": "email",
        "providers": [
          "email"
        ]
    }
  },
];

async function main() {
  console.log('Start seeding...');
  // Use a secure, known password for all test users
  const password = await hash(process.env.NEXT_PUBLIC_TEST_USER_PASSWORD || 'Abdu123+++', 12);

  for (const u of testUsers) {
    const create_data_date = new Date();
    // Use a transaction to ensure both the User and Profile are created or neither is.
    await prisma.$transaction(async (tx) => {
      // 1. Upsert the user in the 'auth' schema
      const user = await tx.user.upsert({
        where: { email: u.email },
        update: {
          aud: "authenticated",
          encrypted_password: password,
          raw_user_meta_data: u.raw_user_meta || undefined,
          raw_app_meta_data: u.raw_app_meta || undefined,
          is_super_admin: u.is_admin,
          updated_at: create_data_date,
        }, // No updates for existing users in this seed script
        create: {
          instance_id: u.id,
          id: u.id,
          aud: "authenticated",
          email: u.email,
          encrypted_password: password,
          raw_user_meta_data: u.raw_user_meta || undefined,
          raw_app_meta_data: u.raw_app_meta || undefined,
          created_at: create_data_date,
          updated_at: create_data_date,
          is_super_admin: u.is_admin,
          email_confirmed_at: create_data_date,
        },
      });
      // 2. Upsert the profile in the 'public' schema, linking it by ID
      await tx.profile.upsert({
        where: { email: u.email },
        update: {
          full_name: u.fullName,
          role: u.role,
          department: u.department,
        }, // No updates for existing profiles
        create: {
          id: user.id, // Explicitly link the profile to the user by ID
          email: u.email,
          full_name: u.fullName,
          role: u.role,
          department: u.department,
          email_confirmed: true,
        },
      });
      console.log(`Created/updated user '${u.fullName}' with id: ${user.id}`);
    });
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
