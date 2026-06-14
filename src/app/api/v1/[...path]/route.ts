import { NextResponse, type NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/api/client";

// Same-origin proxy for every client-side backend call.
//
// The auth cookies (`di_access` / `di_refresh`) are HttpOnly and live on THIS
// (the frontend) origin. A browser will not attach them to a cross-site fetch
// to the API host, so client components must call the backend through here:
// the browser sends the cookies to this same-origin route, we forward them
// upstream, and relay any rotated-token `Set-Cookie` back onto this origin.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-encoding",
  "content-length",
  "host",
]);

async function proxy(request: NextRequest, path: string[]): Promise<Response> {
  const target = `${getApiBaseUrl()}/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);

  const method = request.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return NextResponse.json({ message: "Upstream request failed" }, { status: 502 });
  }

  const contentTypeOut = upstream.headers.get("content-type") ?? "";
  const isStream = contentTypeOut.includes("text/event-stream");

  const response = isStream
    ? new NextResponse(upstream.body, { status: upstream.status })
    : new NextResponse(await upstream.arrayBuffer(), { status: upstream.status });

  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!HOP_BY_HOP.has(lower) && lower !== "set-cookie") {
      response.headers.set(key, value);
    }
  });

  // Relay rotated-token cookies onto the frontend origin (no Domain attribute on
  // the upstream cookie → it re-homes to whichever host serves it, i.e. here).
  const setCookies =
    (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
  for (const value of setCookies) {
    response.headers.append("set-cookie", value);
  }

  if (isStream) {
    response.headers.set("content-type", "text/event-stream");
    response.headers.set("cache-control", "no-cache, no-transform");
    response.headers.set("connection", "keep-alive");
  }

  return response;
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
export async function POST(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
export async function PUT(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
export async function PATCH(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
export async function DELETE(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
