"use client"; // This directive is essential for the App Router

import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { useReadContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { rolesControllerConfig } from "../lib/contracts";

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export function AdminGuard({ children }) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const {
    data: isAdminResult,
    isLoading,
    error,
    isError,
  } = useReadContract({
    ...rolesControllerConfig,
    functionName: "hasRole",
    args: [DEFAULT_ADMIN_ROLE, address],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Explicitly convert to boolean and add debugging
  const isAdmin = Boolean(isAdminResult);

  // Debug logging (remove in production)
  console.log("AdminGuard Debug:", {
    address,
    isConnected,
    chainId,
    expectedChainId: 80002, // Polygon Amoy
    isOnCorrectChain: chainId === 80002,
    isAdminResult,
    isAdmin,
    isLoading,
    isError,
    error,
    contractAddress: rolesControllerConfig.address,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verifying admin status...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-500">
          <h2 className="text-xl font-bold">Error Checking Admin Status</h2>
          <p>Could not verify admin privileges. Please try again.</p>
          <p className="text-sm mt-2">Error: {error?.message}</p>
          {chainId !== 80002 && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
              <p className="text-yellow-800">
                ⚠️ You're connected to chain {chainId}, but this app requires
                Polygon Amoy (80002)
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Please switch to Polygon Amoy testnet in your wallet
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check if user is on the wrong chain
  if (isConnected && chainId !== 80002) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-orange-500">
          <h2 className="text-2xl font-bold">⚠️ Wrong Network</h2>
          <p>Please switch to Polygon Amoy testnet (Chain ID: 80002)</p>
          <p className="text-sm mt-2">
            Currently connected to chain: {chainId}
          </p>
          <div className="mt-4 p-4 bg-orange-100 border border-orange-400 rounded">
            <p className="text-orange-800 text-sm">
              Open your wallet and switch to Polygon Amoy testnet to continue
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isConnected && isAdmin) {
    return <>{children}</>;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <h2 className="text-2xl font-bold">Admin Access Required</h2>
        <p>Please connect the admin wallet to continue.</p>
        <button
          onClick={() => connect({ connector: injected() })}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // Connected but not admin
  const handleSwitchWallet = () => {
    disconnect();
    // Small delay to ensure disconnection completes before reconnecting
    setTimeout(() => {
      connect({ connector: injected() });
    }, 100);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-500">🚫 Access Denied</h2>
        <p>The connected wallet does not have administrative privileges.</p>
        <button
          onClick={handleSwitchWallet}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
        >
          Switch Wallet
        </button>
      </div>
    </div>
  );
}
