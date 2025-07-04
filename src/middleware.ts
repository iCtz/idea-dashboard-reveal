import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of public routes
const publicRoutes = ["/login", "/register", "/api/public"];

// List of auth API routes
const authRoutes = ["/api/auth"];

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // 1. Skip middleware for auth API routes
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 2. Check authentication
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // 3. Handle public routes
  if (publicRoutes.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // 4. Protect private routes
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 5. Role-based access control (example)
  if (pathname.startsWith("/admin") && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
