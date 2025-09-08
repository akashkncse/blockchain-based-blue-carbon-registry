import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { verifyMessage } from "viem"; // You need this to verify signatures

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      async authorize(credentials) {
        try {
          // --- Wallet Login Flow ---
          if (credentials.loginType === "wallet") {
            const { message, signature, walletAddress } = credentials;

            if (!message || !signature || !walletAddress) return null;

            // Verify the signature is valid
            const isValid = await verifyMessage({
              address: walletAddress,
              message: message,
              signature: signature,
            });

            if (!isValid) {
              console.log("Wallet signature check failed.");
              return null;
            }

            // Find user by wallet address
            const userResult = await db.query(
              "SELECT * FROM users WHERE wallet = $1",
              [walletAddress]
            );

            if (userResult.rows.length === 0) {
              console.log("No user found with this wallet address.");
              return null;
            }

            return userResult.rows[0];
          }

          // --- Email & Password Login Flow ---
          if (
            credentials.loginType === "email" ||
            (!credentials.loginType &&
              credentials.email &&
              credentials.password)
          ) {
            const { email, password } = credentials;

            if (!email || !password) {
              console.log("Email or password missing.");
              return null;
            }

            const userResult = await db.query(
              "SELECT * FROM users WHERE email = $1",
              [email]
            );

            if (userResult.rows.length === 0) {
              console.log("No user found with this email.");
              return null;
            }

            const user = userResult.rows[0];
            const passwordsMatch = await bcrypt.compare(
              password,
              user.password
            );

            if (!passwordsMatch) {
              console.log("Password mismatch.");
              return null;
            }

            return user; // Return the full user object
          }

          console.log("No valid login type provided.");
          return null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.status = user.status;
        token.wallet = user.wallet;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.wallet = token.wallet;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
