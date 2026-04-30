import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth";

const PUBLIC_PATHS = ["/welcome", "/login", "/signup", "/auth"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (PUBLIC_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  // Intentional: cookie-presence check only, not signature verification. The
  // backend signs JWTs with HS256 and a kid-keyed secret stored server-side,
  // so the secret cannot be shared with the edge. Forged/expired cookies are
  // rejected by the backend on the next protected API call (which triggers
  // refresh/logout). Revisit if/when the backend migrates to RS256 + JWTs.
  if (request.cookies.get(AUTH_COOKIE_NAME)?.value || request.cookies.get(REFRESH_COOKIE_NAME)?.value) {
    return NextResponse.next();
  }

  const welcomeUrl = new URL("/welcome", request.url);
  if (pathname !== "/") {
    welcomeUrl.searchParams.set("next", `${pathname}${search}`);
  }
  return NextResponse.redirect(welcomeUrl);
}

export const config = {
  // Match every route except Next internals, the API proxy, and static assets.
  // The handler above further short-circuits on PUBLIC_PATHS.
  matcher: ["/((?!_next/|api/|favicon.ico|og.png|robots.txt|sitemap.xml|.*\\.).*)"],
};
