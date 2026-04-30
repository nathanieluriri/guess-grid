const API_BASE_URL = "https://game-api.visichek.app/api/v1";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const response = await fetch(buildApiUrl(path), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
      credentials: "include",
    });

    const body = (await response.json().catch(() => null)) as
      | { data?: T; detail?: string; message?: string; errors?: Array<{ message?: string }> }
      | null;

    return {
      data: body?.data ?? null,
      error: response.ok ? null : body?.message ?? body?.errors?.[0]?.message ?? body?.detail ?? "Request failed",
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Network request failed",
      status: 500,
    };
  }
}
