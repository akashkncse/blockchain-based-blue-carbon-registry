"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useAccount, useSignMessage } from "wagmi"; // Import wagmi hooks

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false); // New state for wallet login
  const router = useRouter();

  // Hooks for wallet interaction
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.log("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first.");
      return;
    }
    setWalletLoading(true);
    setError("");

    try {
      const challengeResponse = await fetch("/api/auth/challenge");
      const { message } = await challengeResponse.json();

      const signature = await signMessageAsync({ message });

      const signInResponse = await signIn("credentials", {
        redirect: false,
        message,
        signature,
        walletAddress: address,
        loginType: "wallet",
      });

      if (signInResponse?.error) {
        setError("Wallet login failed. Is your wallet linked to an account?");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Wallet login error:", err);
      setError(
        "An error occurred during wallet login. The request may have been rejected."
      );
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <>
      <form
        className="border m-4 p-4 rounded-3xl flex flex-col justify-center gap-4 max-w-sm mx-auto mt-10"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold">Login</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      {/* Separator and Wallet Login Button */}
      <div className="max-w-sm mx-auto">
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          onClick={handleWalletLogin}
          disabled={walletLoading}
          className="w-full"
          variant="outline"
        >
          {walletLoading ? "Verifying signature..." : "Login with Wallet"}
        </Button>
      </div>

      <div className="flex items-center justify-center mt-4">
        <p>
          Don't have an account?
          <Link href="/signup" className="text-blue-600 hover:text-red-500">
            {" "}
            Sign up instead.
          </Link>
        </p>
      </div>
    </>
  );
}
