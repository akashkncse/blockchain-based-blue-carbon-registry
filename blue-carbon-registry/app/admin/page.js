"use client"; // This page must be a client component to use hooks and state

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { AdminGuard } from "@/components/AdminGuard";
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
          `/api/admin/pending-requests?adminAddress=${address}`
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
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-4 border-b">
          Pending Role Requests
        </h2>
        {/* ... map over pendingUsers to display them */}
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
