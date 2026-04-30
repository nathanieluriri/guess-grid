import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildApiUrl } from "@/lib/api/client";

const UpgradeSchema = z.object({
  email: z.string().trim().email("Provide a valid email."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(256)
    .regex(/[A-Za-z]/, "Password must contain a letter.")
    .regex(/[0-9]/, "Password must contain a digit."),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(32)
    .regex(/^[A-Za-z0-9._-]+$/, "Username may only contain letters, numbers, dot, dash, underscore.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = UpgradeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid upgrade payload." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const body: Record<string, string> = {
    email: parsed.data.email,
    password: parsed.data.password,
  };
  if (parsed.data.username) {
    body.username = parsed.data.username;
  }

  const backend = await fetch(buildApiUrl("/users/guest/upgrade"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await backend.json().catch(() => null)) as
    | {
        data?: unknown;
        message?: string;
        meta?: { verification_email?: "queued" | "delayed" } | null;
        errors?: Array<{ message?: string }>;
      }
    | null;

  if (!backend.ok) {
    return NextResponse.json(
      { error: payload?.message ?? payload?.errors?.[0]?.message ?? "Unable to upgrade account." },
      { status: backend.status },
    );
  }

  const response = NextResponse.json({
    ok: true,
    user: payload?.data ?? null,
    verificationEmail: payload?.meta?.verification_email ?? "queued",
    message: payload?.message ?? null,
  });
  const setCookieHeaders = (backend.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
  const legacySetCookie = backend.headers.get("set-cookie");
  const cookieValues = setCookieHeaders.length ? setCookieHeaders : legacySetCookie ? [legacySetCookie] : [];
  for (const value of cookieValues) {
    response.headers.append("set-cookie", value);
  }
  return response;
}
