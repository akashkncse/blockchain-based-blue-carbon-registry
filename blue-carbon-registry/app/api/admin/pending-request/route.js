import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";
import { rolesControllerConfig } from "@/lib/contracts";
import { db } from "@/lib/db";

const publicClient = createPublicClient({
  chain: polygonAmoy, // Using the same chain as your wagmi config
  transport: http(), // Using default RPC
});

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export async function GET(request) {
  try {
    // Get the admin address from the query parameters
    const { searchParams } = new URL(request.url);
    const adminAddress = searchParams.get("adminAddress");

    if (!adminAddress) {
      return NextResponse.json(
        { error: "Admin address is required for verification." },
        { status: 400 }
      );
    }

    // 1. Perform the on-chain check from the backend
    const isAdmin = await publicClient.readContract({
      ...rolesControllerConfig,
      functionName: "hasRole",
      args: [DEFAULT_ADMIN_ROLE, adminAddress],
    });

    // 2. If the check fails, deny access
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: The provided address is not an admin." },
        { status: 403 }
      );
    }

    // 3. If the check passes, fetch data from the database
    const result = await db.query(
      "SELECT id, name, email, wallet, role FROM users WHERE status = $1 AND wallet IS NOT NULL",
      ["pending"]
    );

    const pendingUsers = result.rows;

    return NextResponse.json(pendingUsers, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "An internal error occurred." },
      { status: 500 }
    );
  }
}
