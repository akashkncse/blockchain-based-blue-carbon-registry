import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import { SessionProvider } from "next-auth/react";
import { auth } from "../auth";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Blue Carbon Registry India",
  description: "Blue Carbon Registry of India",
};

export default async function RootLayout({ children }) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <Providers>
            <nav>
              <Navbar />
            </nav>
            <main>{children}</main>
          </Providers>
        </body>
      </html>
    </SessionProvider>
  );
}
