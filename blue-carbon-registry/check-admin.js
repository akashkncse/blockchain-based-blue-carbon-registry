// This script will help you check and grant admin role to your address
// You'll need to update the addresses below

const { createPublicClient, createWalletClient, http } = require("viem");
const { polygonAmoy } = require("viem/chains");
const { privateKeyToAccount } = require("viem/accounts");

// Configuration
const CONTRACT_ADDRESS = "0x59397A6b8a0C850f49a8D44095e49B6BbeB5f221"; // Current contract address
const YOUR_ADMIN_ADDRESS = "0xYOUR_ADMIN_ADDRESS_HERE"; // Replace with your admin address
const YOUR_PRIVATE_KEY = "0xYOUR_PRIVATE_KEY_HERE"; // Replace with your private key (be careful!)

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const rolesControllerABI = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

async function checkAndGrantAdminRole() {
  console.log("🔍 Checking admin role status...");

  if (YOUR_ADMIN_ADDRESS === "0xYOUR_ADMIN_ADDRESS_HERE") {
    console.log("❌ Please update YOUR_ADMIN_ADDRESS in the script");
    return;
  }

  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(),
  });

  try {
    // Check current admin status
    console.log(`\n1. Checking if ${YOUR_ADMIN_ADDRESS} has admin role...`);
    const hasAdminRole = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: rolesControllerABI,
      functionName: "hasRole",
      args: [DEFAULT_ADMIN_ROLE, YOUR_ADMIN_ADDRESS],
    });

    console.log(
      `Admin role status: ${
        hasAdminRole ? "✅ HAS ADMIN ROLE" : "❌ NO ADMIN ROLE"
      }`
    );

    if (hasAdminRole) {
      console.log(
        "✅ Your address already has admin role! The admin verification should work."
      );
      console.log("\nIf it's still not working, check:");
      console.log(
        "1. Make sure you're connected to the correct wallet in MetaMask"
      );
      console.log("2. Make sure you're on Polygon Amoy testnet");
      console.log("3. Clear browser cache and reload");
      return;
    }

    // If no admin role, try to grant it (requires private key)
    if (YOUR_PRIVATE_KEY === "0xYOUR_PRIVATE_KEY_HERE") {
      console.log("\n📝 To grant admin role, you need to:");
      console.log(
        "1. Update YOUR_PRIVATE_KEY in this script (be very careful with private keys!)"
      );
      console.log("2. Or use Remix IDE to call grantRole function manually");
      console.log("3. Or use the contract owner address to grant the role");
      return;
    }

    console.log("\n2. Attempting to grant admin role...");

    const account = privateKeyToAccount(YOUR_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: polygonAmoy,
      transport: http(),
    });

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: rolesControllerABI,
      functionName: "grantRole",
      args: [DEFAULT_ADMIN_ROLE, YOUR_ADMIN_ADDRESS],
    });

    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmation...");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction confirmed!");

    // Verify the role was granted
    const hasAdminRoleAfter = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: rolesControllerABI,
      functionName: "hasRole",
      args: [DEFAULT_ADMIN_ROLE, YOUR_ADMIN_ADDRESS],
    });

    console.log(
      `Admin role after grant: ${
        hasAdminRoleAfter ? "✅ SUCCESS" : "❌ FAILED"
      }`
    );
  } catch (error) {
    console.error("❌ Error:", error.message);

    if (error.message.includes("AccessControlUnauthorizedAccount")) {
      console.log(
        "\n💡 This means you don't have permission to grant admin role."
      );
      console.log(
        "You need to use the contract owner address or an existing admin."
      );
    }
  }
}

// Instructions
console.log("📋 INSTRUCTIONS:");
console.log("1. Update YOUR_ADMIN_ADDRESS with your wallet address");
console.log(
  "2. (Optional) Update YOUR_PRIVATE_KEY if you want to auto-grant the role"
);
console.log("3. Run this script to check and potentially grant admin role\n");

checkAndGrantAdminRole();
