import { NextResponse } from "next/server";
import { buildApiUrl } from "@/lib/api/client";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { username?: string; email?: string; password?: string }
    | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const backend = await fetch(buildApiUrl("/users/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
    cache: "no-store",
  });
  const payload = (await backend.json().catch(() => null)) as
    | { data?: unknown; message?: string; errors?: Array<{ message?: string }> }
    | null;
  if (!backend.ok) {
    return NextResponse.json(
      { error: payload?.message ?? payload?.errors?.[0]?.message ?? "Unable to log in." },
      { status: backend.status },
    );
  }

  const response = NextResponse.json({ ok: true, user: payload?.data ?? null });
  const setCookieHeaders = (backend.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
  const legacySetCookie = backend.headers.get("set-cookie");
  const cookieValues = setCookieHeaders.length ? setCookieHeaders : legacySetCookie ? [legacySetCookie] : [];
  for (const value of cookieValues) {
    response.headers.append("set-cookie", value);
  }
  return response;
}
