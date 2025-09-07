"use client"; // Required for using hooks like useSession

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <Link href="/" className="text-2xl">
            <Image
              alt="logo"
              src="/navbarlogo.png"
              width={350 / 2}
              height={125 / 2}
            ></Image>
          </Link>
        </div>
        <div>
          <ul className="flex items-center gap-4">
            {/* While session is loading, show a placeholder */}
            {status === "loading" && (
              <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse" />
            )}

            {/* If user is not logged in, show Login and Sign Up */}
            {status === "unauthenticated" && (
              <>
                <li>
                  <Link href="/login">
                    <Button variant="ghost" size="lg">
                      Login
                    </Button>
                  </Link>
                </li>
                <li>
                  <Link href="/signup">
                    <Button size="lg">Sign Up</Button>
                  </Link>
                </li>
              </>
            )}

            {/* If user is logged in, show Dashboard and Logout */}
            {status === "authenticated" && (
              <>
                <li>
                  <span className="text-lg font-medium">
                    Hi, {session.user.name}
                  </span>
                </li>
                <li>
                  <Link href="/dashboard">
                    <Button variant="outline" size="lg">
                      Dashboard
                    </Button>
                  </Link>
                </li>
                <li>
                  <Button
                    size="lg"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Logout
                  </Button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
