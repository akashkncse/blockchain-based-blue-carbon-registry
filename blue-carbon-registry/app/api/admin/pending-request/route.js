import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains"; // Or your specific chain
import { rolesControllerConfig } from "@/lib/contracts";

const prisma = new PrismaClient();

const publicClient = createPublicClient({
  chain: mainnet, // CHANGE to your chain
  transport: http(process.env.RPC_URL), // Ensure RPC_URL is in your .env
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
      ...contractConfig,
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
    const pendingUsers = await prisma.user.findMany({
      where: { status: "pending", wallet: { not: null } },
      select: { id: true, name: true, email: true, wallet: true, role: true },
    });

    return NextResponse.json(pendingUsers, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "An internal error occurred." },
      { status: 500 }
    );
  }
}
