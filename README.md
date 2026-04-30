# Dead & Injured Frontend

This frontend now runs on Next.js App Router with the existing monochrome UI carried over from the Vite SPA.

## Package manager

This project uses **pnpm**. The committed `pnpm-lock.yaml` is the lockfile of record; `package-lock.json` should not be regenerated. Install dependencies with `pnpm install` and run scripts with `pnpm <script>`. CI must do the same — switching managers across environments produces drift in the resolved dependency tree.

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- `pnpm test`

## Backend URL

The backend base URL is hardcoded to `https://game-api.visichek.app/api/v1`
in `src/lib/api/client.ts`. There is no `.env.local` and no env-based
override — change the constant in `client.ts` if you ever need to point at a
different backend.

## Current behavior

- Public routes render through App Router with the original shell intact.
- Protected routes (`/profile`, `/social`, `/play/online`, `/play/friend`) use an HTTP-only session cookie and redirect to `/login` when absent.
- Backend gaps are routed through typed mock data so the app remains usable while the missing API endpoints are still pending.

## Session cookie contract

The frontend does **not** re-issue session cookies — the FastAPI backend is the
source of truth. `middleware.ts` only checks for cookie presence. The backend
contract (see `backend/core/cookies.py`) is:

- `HttpOnly` — always true, hardcoded server-side.
- `Secure` — driven by `cookie_secure`; forced `true` in production via the
  boot-time check at `backend/core/config.py` (`COOKIE_SECURE must be true when
  ENV=production`). May be `false` in local dev so HTTP localhost works.
- `SameSite` — driven by `cookie_samesite`, default `lax`.
- `Path=/`, explicit `max_age`, no `Domain` (host-scoped).

If those backend defaults ever change, the frontend's trust assumption
(presence ⇒ valid-enough at the edge, signature checked downstream on the API
call) needs to be revisited.
