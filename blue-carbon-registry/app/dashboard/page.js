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

  // Load current wallet address from the session on component mount
  useEffect(() => {
    if (session?.user?.wallet) {
      setCurrentWallet(session.user.wallet);
    }
  }, [session]);

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
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-lg">{session.user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">{session.user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Role</label>
              <p className="text-lg capitalize">{session.user.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Status
              </label>
              <p className="text-lg capitalize">{session.user.status}</p>
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
              {currentWallet ? (
                <code className="text-sm break-all">{currentWallet}</code>
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

              {address !== currentWallet && (
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

              {address === currentWallet && (
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
