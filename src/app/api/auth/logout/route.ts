import { NextResponse } from "next/server";
import { buildApiUrl } from "@/lib/api/client";

export async function POST(request: Request) {
  const backend = await fetch(buildApiUrl("/users/logout"), {
    method: "POST",
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });
  const response = NextResponse.json({ ok: backend.ok }, { status: backend.ok ? 200 : backend.status });
  const setCookieHeaders = (backend.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
  const legacySetCookie = backend.headers.get("set-cookie");
  const cookieValues = setCookieHeaders.length ? setCookieHeaders : legacySetCookie ? [legacySetCookie] : [];
  for (const value of cookieValues) {
    response.headers.append("set-cookie", value);
  }
  return response;
}
