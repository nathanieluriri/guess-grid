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

  // Intentional: cookie-presence check only, not signature verification. The
  // backend signs JWTs with HS256 and a kid-keyed secret stored server-side,
  // so the secret cannot be shared with the edge. Forged/expired cookies are
  // rejected by the backend on the next protected API call (which triggers
  // refresh/logout). Revisit if/when the backend migrates to RS256 + JWKS.
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
