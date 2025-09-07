import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return new NextResponse("Wallet address is required", { status: 400 });
    }

    // Update the user's wallet address in the database
    const result = await db.query(
      "UPDATE users SET wallet = $1 WHERE id = $2 RETURNING id, name, email, role, status, wallet",
      [walletAddress, session.user.id]
    );

    if (result.rows.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({
      message: "Wallet address updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("[UPDATE_WALLET_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
