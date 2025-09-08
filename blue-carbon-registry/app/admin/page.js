"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { AdminGuard } from "@/components/Adminguard";
import { rolesControllerConfig } from "@/lib/contracts";
import toast from "react-hot-toast";

/**
 * PendingUserRow Component
 * Manages the state and actions for a single row in the admin table.
 */
function PendingUserRow({ user, onActionSuccess }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const { data: hash, isPending, writeContract } = useWriteContract();

  // Determine which smart contract function to call based on the user's requested role
  const getFunctionName = (role) => {
    switch (role.toLowerCase()) {
      case "ngo":
        return "grantNGO";
      case "verifier":
        return "grantVerifier";
      default:
        throw new Error(`Unknown role: ${role}`);
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const functionName = getFunctionName(user.role);

      console.log(
        "Starting approval for user:",
        user.name,
        "with role:",
        user.role,
        "using function:",
        functionName
      );
      toast.loading("Awaiting wallet confirmation...");

      writeContract({
        ...rolesControllerConfig,
        functionName: functionName,
        args: [user.wallet],
      });
    } catch (error) {
      console.error("Error in handleApprove:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to approve user.");
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    toast.loading("Rejecting user...");
    try {
      await deleteUser(user.id);
      toast.dismiss();
      toast.success(`User ${user.name} has been rejected and removed.`);
      onActionSuccess(); // Refresh the list
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "Failed to reject user.");
      console.error("Rejection failed:", error);
    } finally {
      setIsRejecting(false);
    }
  };

  // This hook waits for the transaction to be mined and then updates the database
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
      query: {
        enabled: !!hash, // Only run when we have a hash
      },
      onSuccess: async (data) => {
        console.log("Transaction confirmed:", data);
        toast.dismiss();
        toast.loading("Transaction confirmed. Updating database...");
        try {
          await updateUserStatus(user.id, "approved");
          toast.dismiss();
          toast.success(`Role for ${user.name} granted successfully!`);
          setIsApproving(false); // Reset the approving state
          onActionSuccess(); // Refresh the list in the parent component
        } catch (error) {
          toast.dismiss();
          toast.error(
            "On-chain role granted, but DB update failed. Please update manually."
          );
          console.error("Database update failed:", error);
          setIsApproving(false); // Reset the approving state even on error
        }
      },
      onError: (error) => {
        console.error("Transaction failed:", error);
        toast.dismiss();
        toast.error(`Transaction failed: ${error.message}`);
        setIsApproving(false);
      },
    });

  // Effect to handle initial pending state from useWriteContract
  useEffect(() => {
    console.log("Transaction state changed:", {
      isPending,
      isApproving,
      hash: !!hash,
      isConfirming,
    });

    if (isPending) {
      toast.dismiss();
      toast.loading("Processing transaction...");
    } else if (isApproving && !hash && !isPending) {
      // User rejected the transaction in wallet or transaction failed
      console.log("Transaction was rejected or failed");
      toast.dismiss();
      toast.error("Wallet transaction rejected or failed.");
      setIsApproving(false);
    }
  }, [isPending, isApproving, hash, isConfirming]);

  // Effect to log when hash changes
  useEffect(() => {
    if (hash) {
      console.log("Transaction hash received:", hash);
      toast.dismiss();
      toast.loading("Transaction submitted. Waiting for confirmation...");
    }
  }, [hash]);

  // Helper function to call our backend API for updating user status
  const updateUserStatus = async (id, status) => {
    const response = await fetch("/api/admin/update-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to update status to ${status}`
      );
    }
  };

  // Helper function to delete a user (for rejection)
  const deleteUser = async (id) => {
    const response = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete user");
    }
  };

  const isProcessing = isApproving || isRejecting || isConfirming || isPending;

  return (
    <tr key={user.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {user.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
        {user.wallet
          ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}`
          : "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex space-x-2">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isApproving || isConfirming || isPending
              ? "Approving..."
              : "Approve"}
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isRejecting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </td>
    </tr>
  );
}

/**
 * AdminDashboard Component
 * Fetches and displays the list of pending users.
 */
function AdminDashboard() {
  const { address } = useAccount();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTrigger, setFetchTrigger] = useState(0); // State to trigger refetch

  const fetchPendingUsers = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/pending-request?adminAddress=${address}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch pending users");
      }
      const data = await response.json();
      setPendingUsers(data);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, [address, fetchTrigger]); // Re-fetch when address changes or fetchTrigger is updated

  const handleActionSuccess = () => {
    // Increment trigger to cause a refetch
    setFetchTrigger((prev) => prev + 1);
  };

  if (isLoading)
    return <div className="text-center p-8">Loading pending requests...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b bg-gray-50">
          Pending Role Requests ({pendingUsers.length})
        </h2>
        {pendingUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending requests at this time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <PendingUserRow
                    key={user.id}
                    user={user}
                    onActionSuccess={handleActionSuccess}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// The default export for the page route
export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
