import { NextResponse } from "next/server";
import { buildApiUrl } from "@/lib/api/client";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const backend = await fetch(buildApiUrl("/users/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: request.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = (await backend.json().catch(() => null)) as
    | { data?: unknown; message?: string; errors?: Array<{ message?: string }> }
    | null;
  const response = NextResponse.json(
    {
      ok: backend.ok,
      data: payload?.data ?? null,
      error: backend.ok ? null : payload?.message ?? payload?.errors?.[0]?.message ?? "Request failed",
    },
    { status: backend.ok ? 200 : backend.status },
  );
  const setCookieHeaders = (backend.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
  const legacySetCookie = backend.headers.get("set-cookie");
  const cookieValues = setCookieHeaders.length ? setCookieHeaders : legacySetCookie ? [legacySetCookie] : [];
  for (const value of cookieValues) {
    response.headers.append("set-cookie", value);
  }
  return response;
}
