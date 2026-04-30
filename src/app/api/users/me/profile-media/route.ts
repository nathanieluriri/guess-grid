import { NextResponse } from "next/server";
import { buildApiUrl } from "@/lib/api/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const incoming = await request.formData().catch(() => null);
  const file = incoming?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const forwarded = new FormData();
  forwarded.append("file", file, file.name);

  const backend = await fetch(buildApiUrl("/users/me/profile-media"), {
    method: "POST",
    headers: { cookie: request.headers.get("cookie") ?? "" },
    body: forwarded,
    cache: "no-store",
  });

  const payload = (await backend.json().catch(() => null)) as
    | { data?: unknown; message?: string; errors?: Array<{ message?: string }>; detail?: string }
    | null;

  if (!backend.ok) {
    return NextResponse.json(
      {
        error:
          payload?.message ??
          payload?.errors?.[0]?.message ??
          payload?.detail ??
          "Upload failed",
      },
      { status: backend.status },
    );
  }

  return NextResponse.json({ ok: true, user: payload?.data ?? null });
}
