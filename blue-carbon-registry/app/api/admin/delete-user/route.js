import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";
import { rolesControllerConfig } from "@/lib/contracts";
import { db } from "@/lib/db";

const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export async function POST(request) {
  try {
    const { id, adminAddress } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    // Optional: Verify admin role if adminAddress is provided
    if (adminAddress) {
      try {
        const isAdmin = await publicClient.readContract({
          ...rolesControllerConfig,
          functionName: "hasRole",
          args: [DEFAULT_ADMIN_ROLE, adminAddress],
        });

        if (!isAdmin) {
          return NextResponse.json(
            { error: "Forbidden: Not an admin." },
            { status: 403 }
          );
        }
      } catch (contractError) {
        console.error("Admin verification failed:", contractError);
        // Continue without verification for now
      }
    }

    // First, get user info before deletion
    const userResult = await db.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Delete user from database
    const deleteResult = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );

    if (deleteResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to delete user." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `User ${user.name} has been deleted`,
        deletedUser: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "An internal error occurred." },
      { status: 500 }
    );
  }
}
