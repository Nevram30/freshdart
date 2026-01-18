import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfigEdge } from "~/server/auth/config.edge";

const { auth } = NextAuth(authConfigEdge);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");
  const isDashboardPage =
    nextUrl.pathname.startsWith("/customer/dashboard") ||
    nextUrl.pathname.startsWith("/merchant/dashboard") ||
    nextUrl.pathname.startsWith("/producer/dashboard");

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    const role = req.auth?.user?.role;
    const redirectPaths: Record<string, string> = {
      CUSTOMER: "/customer/dashboard",
      MERCHANT: "/merchant/dashboard",
      PRODUCER: "/producer/dashboard",
    };
    const redirectPath = redirectPaths[role ?? "CUSTOMER"] ?? "/customer/dashboard";
    return NextResponse.redirect(new URL(redirectPath, nextUrl));
  }

  // Protect dashboard routes
  if (isDashboardPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/register", "/customer/:path*", "/merchant/:path*", "/producer/:path*"],
};
