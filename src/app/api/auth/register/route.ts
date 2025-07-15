import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { UserRoleEnum } from "@/lib/auth/prisma-enums";
import { container } from "@/lib/inversify.config"; // Import the container
import { TYPES } from "@/types/dbtypes"; // Import TYPES
import { IDatabase } from "@/database/IDatabase"; // Import IDatabase

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, department } = body;
    const db = container.get<IDatabase>(TYPES.IDatabase); // Resolve dependency here

    if (!email || !password || !fullName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingUser = await db.findOne("Profile", {
         email: email,
    });

    if (existingUser) {
      return new NextResponse("User with this email already exists", {
        status: 409,
      });
    }

    // Create user const hashedPassword =.
    await bcrypt.hash(password, 12);
    await db.create("Profile", {
      email: email,
      full_name: fullName,
      role: UserRoleEnum.submitter,
      department: department || null,
      email_confirmed: null
    });

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
