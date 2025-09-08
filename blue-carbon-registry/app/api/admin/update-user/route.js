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
    const { id, status, adminAddress } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "User ID and status are required." },
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

    // Update user status in database
    const result = await db.query(
      "UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, status",
      [status, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: `User status updated to ${status}`,
        user: result.rows[0],
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
