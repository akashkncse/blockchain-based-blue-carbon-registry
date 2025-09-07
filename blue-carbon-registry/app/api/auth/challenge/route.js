// app/api/auth/challenge/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    // Generate a secure, random string
    const nonce = crypto.randomBytes(32).toString("hex");

    // Create a user-friendly message with the nonce
    const message = `Welcome to the Blue Carbon Registry! Please sign this message to continue. Nonce: ${nonce}`;

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[CHALLENGE_GET] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
