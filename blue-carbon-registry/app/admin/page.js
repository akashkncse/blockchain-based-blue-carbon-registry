"use client"; // This page must be a client component to use hooks and state

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { AdminGuard } from "@/components/Adminguard";
import toast from "react-hot-toast";

// This is the component that shows the actual admin UI.
// We keep it separate for clarity.
function AdminDashboard() {
  const { address } = useAccount(); // Get the connected admin's address
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // This is a placeholder for the user row component from the previous answer
  // It contains the "Approve" button and the useWriteContract logic.
  const PendingUserRow = ({ user, onApprovalSuccess }) => {
    /* ... same as before */
  };

  useEffect(() => {
    const fetchPendingUsers = async () => {
      if (!address) return; // Don't fetch if the wallet is not connected yet

      setIsLoading(true);
      try {
        // Pass the admin address to the API for backend verification
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

    fetchPendingUsers();
  }, [address]); // Re-fetch if the connected account changes

  // ... (rest of the AdminDashboard JSX, displaying users, loading states, etc.)
  // This part is the same as the previous "AdminPage" component.
  if (isLoading) return <div>Loading pending requests...</div>;

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
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {user.wallet
                        ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(
                            -4
                          )}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                          Approve
                        </button>
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
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
