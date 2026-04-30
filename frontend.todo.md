# Frontend Improvements — open items

The decision items below have all been resolved (answers + code changes
applied). The remaining sections are explicitly out of scope for inline work
— they need either a dedicated branch, external infra, or hands-on manual
verification — and are kept here as a scheduling/checklist surface.

---

## Resolved decisions

- [x] **Pick one package manager** — pnpm chosen. `pnpm-lock.yaml` is the
  lockfile of record; `package-lock.json` is not committed. README documents
  this. Drift across environments is avoided by everyone (and CI, when added)
  using `pnpm`.

- [x] **Validate JWTs in middleware** — intentionally not validating.
  Backend signs with HS256 + per-`kid` shared secret stored in Mongo
  (`backend/security/encrypting_jwt.py`); the secret cannot be shared with the
  edge. `middleware.ts` only checks cookie presence; expired/forged cookies
  are rejected by the backend on the next protected API call, which triggers
  refresh/logout client-side. A comment in `middleware.ts` documents this.
  Revisit only when the RS256 + JWKS migration in the root `todo.md` ships.

- [x] **Enforce cookie flags** — backend already sets `HttpOnly` (hardcoded),
  `Secure` (forced true in production via `COOKIE_SECURE` boot check), and
  `SameSite=lax` (default). Documented in README under "Session cookie
  contract". No egress re-issuing in Next route handlers.

- [x] **OG / Twitter image** — `layout.tsx` now references `/og.png`
  (1200×630) for both `og:image` and `twitter:image`. **Action still
  needed:** drop the actual PNG into `public/og.png`. The metadata pointer
  is in place; the asset is content work.

- [x] **Analytics + error reporting** — explicitly deferred. No instrumentation
  added now.

- [x] **Bundle / perf budgets** — `@next/bundle-analyzer` installed, wired
  into `next.config.mjs`, and exposed via `pnpm analyze`
  (`ANALYZE=true next build`). No CI gate; per CLAUDE.md, run it manually
  before shipping a feature and refactor any read-only route that blows past
  ~90 KB.

---

## Larger efforts to schedule

- [ ] **Support profile media upload + rendering** — backend now exposes authenticated `POST /api/v1/users/me/profile-media` multipart upload and returns `profile_media_url`, `profile_media_type`, `profile_media_kind`, `profile_media_filename`, and `profile_media_size_bytes` on the user object. Build a profile settings uploader, preview selected files before submit, and render by media type: `<img>` for images/GIF, a Lottie player for `profile_media_kind === "lottie"`, and muted/looped `<video>` for video formats.
- [ ] **Enable TypeScript strict mode** — flip `strict`, `noImplicitAny`, `strictNullChecks` to `true` in `tsconfig.json` and fix the resulting errors. Touches almost every file; warrants a dedicated branch.
- [ ] **Re-enable `@typescript-eslint/no-unused-vars`** — `eslint.config.js:26` disables it. Re-enabling it on a strict-mode pass will catch dead code; do it together with the strict-mode flip.
- [ ] **Type the API client end-to-end** — generate types from the FastAPI OpenAPI schema (`openapi-typescript` or similar) and use them in `src/lib/api/server.ts` and `src/lib/api/client.ts` so each call site is fully typed. Needs backend OpenAPI spec to be stable.
- [ ] **Raise test coverage** — `src/test/example.test.ts` is a placeholder. Cover API client error paths, form validation, guess evaluation, and JWT refresh.
- [ ] **Add e2e tests** — no Playwright/Cypress yet. Start with login → play → submit guess → see result.
- [ ] **CI workflow** — no `.github/workflows/`. Add a workflow that runs `pnpm lint`, typecheck, `pnpm test`, and `pnpm audit`.
- [ ] **Build the password-reset flow** — auth covers login/signup/logout but not "forgot password." Needs backend support too.
- [ ] **Constrain Tailwind arbitrary values** — patterns like `bg-[hsl(var(--signal-danger)/0.12)]` appear in many places; promote them to semantic utilities or a Tailwind plugin in a single sweep.
- [ ] **Audit focus-ring usage** — `ring-focus` (per CLAUDE.md) is used in most components but not all interactive elements. Walk through buttons / links / inputs / drag handles and add it where missing.

## Manual verification

- [ ] **Verify dark-mode contrast** — run Lighthouse / axe and fix anything below WCAG AA 4.5:1. Watch `--text-tertiary` over `--bg-base`.
- [ ] **Manually verify `not-found.tsx`** — render an unknown URL and confirm the custom 404 (not an auth redirect) is shown.
- [ ] **Audit `useMemo` usage** — `GameBoard.tsx:82-84` memoizes three values without profiling. Drop any that don't measurably help once you have a profile.
- [ ] **Lazy-load heavy components** — consider `next/dynamic` for `GameBoard.tsx` (dnd-kit + DigitTray + PowerUpTile) if it ends up below the fold on any route. Profile first.
- [ ] **Stream slow page sections** — once you can profile real backend latencies, wrap independent sections in `<Suspense>` so the shell paints fast.
- [ ] **Debounce client requests** — once search / live-guess inputs are wired up, add debouncing for any noisy inputs hitting the API.
