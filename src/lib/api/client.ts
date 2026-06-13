// The backend origin is environment-driven so local/staging builds can point at
// their own API instead of production. Falls back to the hosted API when unset.
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://game-api.visichek.app/api/v1"
).replace(/\/$/, "");

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  status: number;
}

const DEFAULT_TIMEOUT_MS = 15000;

function isIdempotent(method: string | undefined) {
  const m = (method ?? "GET").toUpperCase();
  return m === "GET" || m === "HEAD";
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number; retries?: number },
): Promise<ApiResult<T>> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries, ...requestInit } = init ?? {};
  // Retry transient network failures once for safe (idempotent) reads by default.
  const maxAttempts = 1 + (retries ?? (isIdempotent(requestInit.method) ? 1 : 0));

  let lastError = "Network request failed";
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    // Chain any caller-supplied signal into our controller so the timeout abort
    // still fires even when the caller passes its own signal.
    const externalSignal = requestInit.signal;
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(buildApiUrl(path), {
        ...requestInit,
        headers: {
          "Content-Type": "application/json",
          ...(requestInit.headers ?? {}),
        },
        cache: "no-store",
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timer);

      const body = (await response.json().catch(() => null)) as
        | { data?: T; detail?: string; message?: string; errors?: Array<{ message?: string }> }
        | null;

      return {
        data: body?.data ?? null,
        error: response.ok
          ? null
          : body?.message ?? body?.errors?.[0]?.message ?? body?.detail ?? `Request failed (${response.status})`,
        status: response.status,
      };
    } catch (error) {
      clearTimeout(timer);
      const aborted = error instanceof DOMException && error.name === "AbortError";
      lastError = aborted
        ? "The request timed out. Check your connection and try again."
        : error instanceof Error
          ? error.message
          : "Network request failed";
      // Don't burn the retry on a user-initiated abort.
      if (requestInit.signal?.aborted) break;
    }
  }

  return { data: null, error: lastError, status: 0 };
}
