import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { UserRoleEnum } from "@/lib/auth/prisma-enums";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingUser = await db.profile.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User with this email already exists", {
        status: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.profile.create({
      data: { email, password: hashedPassword, full_name: fullName, role: UserRoleEnum.submitter },
    });

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
