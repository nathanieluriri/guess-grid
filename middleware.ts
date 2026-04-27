import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth";

const PROTECTED_PREFIXES = ["/profile", "/social", "/play/friend", "/play/online"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requiresAuth = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!requiresAuth) {
    return NextResponse.next();
  }

  if (request.cookies.get(AUTH_COOKIE_NAME)?.value || request.cookies.get(REFRESH_COOKIE_NAME)?.value) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/profile/:path*", "/social/:path*", "/play/friend/:path*", "/play/online/:path*"],
};
