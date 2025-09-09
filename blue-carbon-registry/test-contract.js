const { createPublicClient, http } = require("viem");
const { polygonAmoy } = require("viem/chains");

// Test contract configuration
const rolesControllerConfig = {
  address: "0x59397A6b8a0C850f49a8D44095e49B6BbeB5f221",
  abi: [
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
  ],
};

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

async function testContract() {
  console.log("Testing contract connection...");

  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(),
  });

  try {
    // Test 1: Check if contract exists
    console.log("1. Testing contract existence...");
    const code = await publicClient.getBytecode({
      address: rolesControllerConfig.address,
    });
    console.log("Contract bytecode exists:", code ? "Yes" : "No");

    // Test 2: Try to read DEFAULT_ADMIN_ROLE
    console.log("2. Testing DEFAULT_ADMIN_ROLE...");
    const adminRole = await publicClient.readContract({
      ...rolesControllerConfig,
      functionName: "DEFAULT_ADMIN_ROLE",
    });
    console.log("DEFAULT_ADMIN_ROLE:", adminRole);

    // Test 3: Test hasRole with a dummy address (should return false)
    console.log("3. Testing hasRole with dummy address...");
    const dummyAddress = "0x0000000000000000000000000000000000000000";
    const hasRoleDummy = await publicClient.readContract({
      ...rolesControllerConfig,
      functionName: "hasRole",
      args: [DEFAULT_ADMIN_ROLE, dummyAddress],
    });
    console.log("Dummy address has admin role:", hasRoleDummy);

    // Test 4: Let's test different RPC endpoints and configurations
    console.log("4. Testing with different RPC configurations...");

    // Test with Polygon Amoy's public RPC
    const publicClient2 = createPublicClient({
      chain: polygonAmoy,
      transport: http("https://rpc-amoy.polygon.technology"),
    });

    try {
      const hasRoleDummy2 = await publicClient2.readContract({
        ...rolesControllerConfig,
        functionName: "hasRole",
        args: [DEFAULT_ADMIN_ROLE, dummyAddress],
      });
      console.log(
        "With explicit RPC - Dummy address has admin role:",
        hasRoleDummy2
      );
    } catch (error) {
      console.log("Error with explicit RPC:", error.message);
    }

    // Test 5: Let's check what chain ID we're actually on
    console.log("5. Checking chain information...");
    const chainId = await publicClient.getChainId();
    console.log("Chain ID:", chainId);
    console.log("Expected Chain ID for Polygon Amoy:", polygonAmoy.id);

    // Test 6: Let's make sure the contract address is checksummed correctly
    console.log("6. Contract address verification...");
    console.log("Current contract address:", rolesControllerConfig.address);
    console.log("Address length:", rolesControllerConfig.address.length);

    // Test if you need to provide your admin address manually for testing
    console.log("\n📝 To test with your admin address:");
    console.log(
      "Replace 'YOUR_ADMIN_ADDRESS_HERE' in the test below with your actual admin address"
    );

    const yourAdminAddress = "YOUR_ADMIN_ADDRESS_HERE"; // You can replace this
    if (
      yourAdminAddress !== "YOUR_ADMIN_ADDRESS_HERE" &&
      yourAdminAddress.startsWith("0x")
    ) {
      console.log("7. Testing with your admin address...");
      const hasRoleYourAdmin = await publicClient.readContract({
        ...rolesControllerConfig,
        functionName: "hasRole",
        args: [DEFAULT_ADMIN_ROLE, yourAdminAddress],
      });
      console.log(
        `Your address ${yourAdminAddress} has admin role:`,
        hasRoleYourAdmin
      );
    }

    console.log("✅ Contract test completed successfully!");
  } catch (error) {
    console.error("❌ Contract test failed:");
    console.error("Error:", error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
}

testContract();
