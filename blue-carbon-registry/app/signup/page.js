"use client";
import React from "react";
import Link from "next/link";
import { useState } from "react";
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
  const [loading, setLoading] = useState(0);
  const handleSubmit = async (e) => {
    setLoading(1);
    e.preventDefault();
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, email, role }),
      });
      if (!res.ok) {
        throw new Error("Signup failed");
      }
      const data = await res.json();
      console.log("Success: ", data);
    } catch (error) {
      console.log(error);
    }
    setLoading(0);
  };
  return (
    <>
      <form
        className="border m-4 p-4 rounded-3xl flex flex-col justify-center gap-4 max-w-sm mx-auto mt-10"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold">Sign Up</h2>
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
