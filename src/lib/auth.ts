export const AUTH_COOKIE_NAME = "di_access";
export const REFRESH_COOKIE_NAME = "di_refresh";

export type GoogleOAuthTarget = "local" | "dev" | "prod" | "mobile";

/** Pick a Google OAuth target name based on the runtime origin. */
export function pickGoogleOAuthTarget(): GoogleOAuthTarget {
  if (typeof window === "undefined") {
    return "local";
  }
  const explicit = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_TARGET;
  if (explicit === "local" || explicit === "dev" || explicit === "prod" || explicit === "mobile") {
    return explicit;
  }
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) {
    return "local";
  }
  return "prod";
}
