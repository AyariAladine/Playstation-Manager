import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("ps-shop-session");
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === "/login") {
    // If already logged in, redirect to dashboard
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes (dashboard and all sub-routes)
  if (pathname.startsWith("/dashboard") || 
      pathname.startsWith("/playstations") || 
      pathname.startsWith("/players") || 
      pathname.startsWith("/games") || 
      pathname.startsWith("/sessions") || 
      pathname.startsWith("/settings") || 
      pathname.startsWith("/stats")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Root redirect
  if (pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/playstations/:path*",
    "/players/:path*",
    "/games/:path*",
    "/sessions/:path*",
    "/settings/:path*",
    "/stats/:path*",
  ],
};
