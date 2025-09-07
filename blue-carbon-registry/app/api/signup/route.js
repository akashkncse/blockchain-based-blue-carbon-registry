import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;
    if (!email || !password || !name || !role) {
      return new NextResponse("Creds are required", {
        status: 400,
      });
    }

    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return new NextResponse("User with this email already exists", {
        status: 409,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.query(
      "INSERT INTO users (email, password, role, status, name) VALUES ($1, $2, $3, $4, $5) RETURNING name, email, role, status",
      [email, hashedPassword, role, "pending", name]
    );
    return NextResponse.json(newUser.rows[0], { status: 201 });
  } catch (error) {
    console.error("[SIGNUP_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
