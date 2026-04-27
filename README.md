# Dead & Injured Frontend

This frontend now runs on Next.js App Router with the existing monochrome UI carried over from the Vite SPA.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`

## Environment

Copy `.env.local.example` to `.env.local` and adjust as needed:

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`
- `API_BASE_URL_INTERNAL=http://backend:8000/api/v1`

## Current behavior

- Public routes render through App Router with the original shell intact.
- Protected routes (`/profile`, `/social`, `/play/online`, `/play/friend`) use an HTTP-only session cookie and redirect to `/login` when absent.
- Backend gaps are routed through typed mock data so the app remains usable while the missing API endpoints are still pending.
