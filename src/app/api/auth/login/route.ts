import { NextResponse } from "next/server";
import { buildApiUrl } from "@/lib/api/client";
import { LoginSchema } from "@/lib/auth/schemas";

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid login payload." },
      { status: 400 },
    );
  }

  const backend = await fetch(buildApiUrl("/users/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
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
