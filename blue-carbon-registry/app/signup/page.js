"use client";
import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPw] = useState("");
  const [role, setRole] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Create the user account
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, email, role }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Signup failed");
      }

      const userData = await res.json();
      console.log("Signup successful:", userData);

      // Step 2: Automatically sign in the user
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
        loginType: "email",
      });

      if (signInResult?.error) {
        // Signup was successful but auto-login failed
        setSuccess("Account created successfully!");
        setError("Please log in manually.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // Both signup and login were successful
        setSuccess(
          "Account created and logged in successfully! Redirecting..."
        );
        console.log("Auto-login successful");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <form
        className="border m-4 p-4 rounded-3xl flex flex-col justify-center gap-4 max-w-sm mx-auto mt-10"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold">Sign Up</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          onChange={(e) => setPw(e.target.value)}
          required
        />

        <Select required value={role} onValueChange={(value) => setRole(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Role</SelectLabel>
              <SelectItem value="NGO">NGO</SelectItem>
              <SelectItem value="Verifier">Verifier</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
      <div className="flex items-center justify-center">
        <p>
          If you already have an account,
          <Link href="/login" className="text-blue-600 hover:text-red-500">
            {" "}
            Login instead.
          </Link>
        </p>
      </div>
    </>
  );
}
