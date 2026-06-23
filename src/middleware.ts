import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "rxflow_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "rxflow-ai-super-secret-key-change-me-in-production-12345"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let payload = null;
  if (token) {
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, JWT_SECRET);
      payload = verifiedPayload as { userId: string; role: string; email: string };
    } catch (e) {
      // Invalid token, treat as logged out
    }
  }

  // Dashboard routes checking
  const isPatientRoute = pathname.startsWith("/patient");
  const isDoctorRoute = pathname.startsWith("/doctor");
  const isPharmacyRoute = pathname.startsWith("/pharmacy");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isPatientRoute || isDoctorRoute || isPharmacyRoute || isAdminRoute) {
    if (!payload) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    const { role } = payload;
    // Check roles
    if (isPatientRoute && role !== "PATIENT") {
      return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
    }
    if (isDoctorRoute && role !== "DOCTOR") {
      return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
    }
    if (isPharmacyRoute && role !== "PHARMACIST") {
      return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
    }
    if (isAdminRoute && role !== "ADMIN") {
      return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
    }
  }

  if (isAuthRoute && payload) {
    // Already logged in, redirect to correct dashboard
    return NextResponse.redirect(new URL(getDashboardUrl(payload.role), request.url));
  }

  return NextResponse.next();
}

function getDashboardUrl(role: string): string {
  switch (role) {
    case "PATIENT":
      return "/patient/dashboard";
    case "DOCTOR":
      return "/doctor/dashboard";
    case "PHARMACIST":
      return "/pharmacy/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

export const config = {
  matcher: [
    "/patient/:path*",
    "/doctor/:path*",
    "/pharmacy/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
