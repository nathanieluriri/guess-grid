import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth";

// Cookies look present to middleware but the backend rejected /users/me.
// Clear them and bounce to /welcome so the visitor can re-auth or guest in.
export function GET(request: Request) {
  const url = new URL("/welcome", request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
