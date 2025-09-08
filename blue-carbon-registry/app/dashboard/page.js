"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Dashboard() {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage(); // Correctly get the async function
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [currentWallet, setCurrentWallet] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load current wallet address from the session on component mount
  useEffect(() => {
    if (session?.user?.wallet) {
      setCurrentWallet(session.user.wallet);
    }
  }, [session]);

  // Fetch fresh user profile data
  const fetchUserProfile = async () => {
    if (!session?.user?.id) return;

    setIsLoadingProfile(true);
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch user profile on component mount and set up periodic refresh
  useEffect(() => {
    fetchUserProfile();

    // Refresh user profile every 30 seconds to check for status updates
    const interval = setInterval(fetchUserProfile, 30000);

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  const handleUpdateWallet = async () => {
    if (!isConnected || !address) {
      setMessage("Please connect your wallet first.");
      return;
    }

    try {
      setIsUpdating(true);
      setMessage("");

      const messageToSign = `Verify wallet ownership for Blue Carbon Registry: ${address}`;

      // Await the signMessageAsync function to get the signature
      const signature = await signMessageAsync({ message: messageToSign });

      // Send wallet address and signature to the backend for verification
      const response = await fetch("/api/update-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          signature: signature,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentWallet(address);
        setMessage("Wallet address updated successfully!");
        // Refresh the user profile to show updated wallet
        await fetchUserProfile();
        // To see the change reflected immediately, it's best to refetch the session
        // or trigger a page reload after a short delay.
      } else {
        setMessage(data.error || "Failed to update wallet address.");
      }
    } catch (error) {
      console.error("Error updating wallet:", error);
      if (error.message.includes("User rejected the request")) {
        setMessage("Signature request was rejected in your wallet.");
      } else {
        setMessage(`Error: ${error.message || "An unknown error occurred."}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // If the session is loading or doesn't exist, show an access denied message.
  if (!session) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>Please log in to access the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Your account details
                {isLoadingProfile && (
                  <span className="ml-2 text-xs text-blue-600">
                    • Updating...
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUserProfile}
              disabled={isLoadingProfile}
            >
              {isLoadingProfile ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-lg">
                {userProfile?.name || session?.user?.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">
                {userProfile?.email || session?.user?.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Role</label>
              <p className="text-lg capitalize">
                {userProfile?.role || session?.user?.role}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Status
              </label>
              <div className="flex items-center gap-2">
                <p
                  className={`text-lg capitalize font-medium ${
                    (userProfile?.status || session?.user?.status) ===
                    "approved"
                      ? "text-green-600"
                      : (userProfile?.status || session?.user?.status) ===
                        "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {userProfile?.status || session?.user?.status}
                </p>
                {(userProfile?.status || session?.user?.status) ===
                  "approved" && <span className="text-green-600">✓</span>}
                {(userProfile?.status || session?.user?.status) ===
                  "pending" && <span className="text-yellow-600">⏳</span>}
              </div>
              {(userProfile?.status || session?.user?.status) === "pending" && (
                <p className="text-xs text-gray-500 mt-1">
                  Your account is pending approval. You'll have access to
                  features once approved.
                </p>
              )}
              {(userProfile?.status || session?.user?.status) ===
                "approved" && (
                <p className="text-xs text-green-600 mt-1">
                  Your account has been approved! You have full access to
                  features.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Connection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
          <CardDescription>
            Connect and link your wallet to enable blockchain features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Current Linked Wallet
            </label>
            <div className="p-3 bg-gray-50 rounded-md mt-1">
              {userProfile?.wallet || currentWallet ? (
                <code className="text-sm break-all">
                  {userProfile?.wallet || currentWallet}
                </code>
              ) : (
                <span className="text-gray-500">No wallet linked</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Connect or Switch Wallet
            </label>
            <ConnectButton />
          </div>

          {isConnected && (
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Currently Connected Address
                </label>
                <div className="p-3 bg-blue-50 rounded-md mt-1">
                  <code className="text-sm break-all">{address}</code>
                </div>
              </div>

              {address !== (userProfile?.wallet || currentWallet) && (
                <Button
                  onClick={handleUpdateWallet}
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating
                    ? "Updating..."
                    : "Link This Wallet to Your Account"}
                </Button>
              )}

              {address === (userProfile?.wallet || currentWallet) && (
                <div className="text-green-600 text-sm flex items-center justify-center p-2 bg-green-50 rounded-md">
                  ✓ This wallet is already linked to your account.
                </div>
              )}
            </div>
          )}

          {message && (
            <div
              className={`p-3 rounded-md text-sm text-center ${
                message.includes("success")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
