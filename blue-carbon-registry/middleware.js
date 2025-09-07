// middleware.js

// 1. Rename the 'auth' import to 'nextAuth' to avoid conflicts.
import { auth as nextAuth } from "@/auth";

// 2. Use the new name 'nextAuth' to wrap your middleware logic.
export default nextAuth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

// Your config remains the same.
export const config = {
  matcher: ["/dashboard/:path*"],
  runtime: "nodejs", // Force Node.js runtime to avoid edge runtime crypto issues
};
