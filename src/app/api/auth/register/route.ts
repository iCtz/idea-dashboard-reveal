import { db } from "@lib/db";
import { getDatabase } from "@/database";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { UserRoleEnum } from "@/lib/auth/prisma-enums";

export async function POST(req: Request) {
  const database = getDatabase();
  try {
    const body = await req.json();
    const { email, password, fullName, name, department } = body;

    if (!email || !password || !fullName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingUser = await database.findOne("Profile", {
         email: email,
    });
    // const existingUser = await db.profile.findUnique({
    //   where: { email },
    // });

    if (existingUser) {
      return new NextResponse("User with this email already exists", {
        status: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await database.create("Profile", {
        email: email,
        password: hashedPassword,
        full_name: fullName,
        role: UserRoleEnum.submitter,
        name: name || null, // Assuming 'name' is optional and can be null
        department: department || null, // Assuming 'department' is optional and can be null
      });
    // await db.profile.create({
    //   data: { email, password: hashedPassword, full_name: fullName, role: UserRoleEnum.submitter },
    // });

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
