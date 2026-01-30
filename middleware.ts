import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Public routes - always accessible
  const publicPrefixes = ["/api/auth", "/api/webhooks", "/share"];
  if (publicPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Admin login page - standalone, no sidebar
  if (pathname === "/admin/login") {
    // If already logged in as admin, redirect to admin dashboard
    if (isLoggedIn && role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // User auth pages - redirect logged-in users to dashboard
  const authPages = ["/login", "/register", "/verify-email"];
  if (authPages.some((p) => pathname.startsWith(p))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Admin routes - require admin role, separate login flow
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // App routes - require authentication
  const protectedPrefixes = [
    "/dashboard",
    "/profile",
    "/items",
    "/stores",
    "/prices",
    "/lists",
    "/compare",
    "/discover",
    "/receipts",
    "/inventory",
    "/spending",
  ];
  if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, req.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
