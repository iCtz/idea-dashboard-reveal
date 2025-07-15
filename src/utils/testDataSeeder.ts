
import { logger } from '@/lib/logger';
export const seedTestUsers = async () => {
  const testUsers = [
    {
      email: "submitter@test.com",
      password: "password123",
      full_name: "Alice Johnson",
      role: "submitter" as const,
      department: "Product Development"
    },
    {
      email: "evaluator@test.com",
      password: "password123",
      full_name: "Bob Smith",
      role: "evaluator" as const,
      department: "Innovation Committee"
    },
    {
      email: "management@test.com",
      password: "password123",
      full_name: "Carol Davis",
      role: "management" as const,
      department: "Executive Leadership"
    }
  ];

  logger.debug("Test users are available with the following credentials:");
  testUsers.forEach(user => {
    logger.debug(`${user.role}: ${user.email} / ${user.password}`);
  });

  return testUsers;
};
