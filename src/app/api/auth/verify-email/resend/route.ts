import { NextResponse } from "next/server";
import { buildApiUrl } from "@/lib/api/client";

export async function POST(request: Request) {
  const backend = await fetch(buildApiUrl("/users/verify-email/resend"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: request.headers.get("cookie") ?? "",
    },
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
  return NextResponse.json(
    {
      ok: backend.ok,
      verificationEmail: payload?.meta?.verification_email ?? null,
      message: payload?.message ?? null,
      error: backend.ok ? null : payload?.message ?? payload?.errors?.[0]?.message ?? "Request failed",
    },
    { status: backend.ok ? 200 : backend.status },
  );
}
