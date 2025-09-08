"use client"; // This directive is essential for the App Router

import { useAccount, useConnect } from "wagmi";
import { useReadContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { rolesControllerConfig } from "@/lib/contracts";
const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export function AdminGuard({ children }) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const { data: isAdmin, isLoading } = useReadContract({
    ...rolesControllerConfig,
    functionName: "hasRole",
    args: [DEFAULT_ADMIN_ROLE, address],
    query: {
      enabled: isConnected,
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verifying admin status...</p>
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

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-500">🚫 Access Denied</h2>
        <p>The connected wallet does not have administrative privileges.</p>
      </div>
    </div>
  );
}
