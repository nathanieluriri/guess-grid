# Frontend Improvements — open items

Only the items below remain. They each need a decision, an external resource, or a long-running effort that should be scheduled rather than done inline. Items that could be handled without input have been completed and removed from this list.

---

## Needs an answer / decision

- [ ] **Pick one package manager** — both `package-lock.json` and `pnpm-lock.yaml` are committed. Decide between npm and pnpm, delete the loser, document the choice in `README.md`, and align CI to match. *Which one do you want to keep?*

ANSWER: I choose package-lock.json

- [ ] **Validate JWTs in middleware** — `middleware.ts:5` only checks for cookie *presence*. Need the backend's signing key (or a public JWKS endpoint) to verify signature + `exp`. *How does the FastAPI backend sign tokens — symmetric secret or RS256/JWKS?*

ANSWER: HS256 with `kid`-keyed shared secrets stored in Mongo (`db.secret_keys`,
see `backend/security/encrypting_jwt.py:53-74`). The secret cannot be shared
with the frontend — anything that can verify can also forge.

For hobby scope, do **not** validate JWTs in middleware. Keep the cookie-presence
check as-is. The backend is already the source of truth: any expired or forged
cookie produces a 401 on the next protected API call, and the frontend triggers
refresh/logout from there. Middleware's only job is "no cookie → redirect to
login," which it already does.

Close this item as "intentional, documented" and add a one-line comment in
`middleware.ts` saying so. Revisit only if/when the RS256 + JWKS migration in
the root `todo.md` actually ships — that migration is what unlocks proper
edge-side verification.

- [ ] **Enforce cookie flags** — `middleware.ts` trusts the backend to send `HttpOnly; Secure; SameSite`. Either document that contract, or have the Next route handlers re-issue the cookie with explicit flags. *Confirm the backend currently sets `HttpOnly; Secure; SameSite=Lax` (or similar) — if yes we just document, if no we enforce on egress.*

ANSWER: yes — the backend already sets all three flags. So this becomes a "document the contract" task, not an "enforce on egress" task
What backend/core/cookies.py:8-27 actually emits
For both di_access and di_refresh:

HttpOnly — hardcoded True (cookies.py:13,22). Cannot be turned off via config.
Secure — driven by settings.cookie_secure. Forced True in production by the boot-time check at config.py:66-67 (RuntimeError("COOKIE_SECURE must be true when ENV=production")). May be False in dev — that's deliberate so HTTP localhost works.
SameSite — driven by settings.cookie_samesite, default lax (config.py:59).
Path=/, max_age set explicitly.
Domain is not set — cookie is host-scoped to whatever served it.



- [ ] **OG / Twitter image** — `src/app/layout.tsx` declares OpenGraph + Twitter card without `og:image` / `twitter:image`. *Either provide a static asset (e.g. `public/og.png`, 1200×630) or approve a dynamic `/api/og` route.*

ANSWER: Static asset. Drop a single 1200×630 PNG at `public/og.png` and
reference it from `layout.tsx` as both `og:image` and `twitter:image`. No
dynamic `/api/og` route — extra runtime cost and more deps for no hobby-scope
payoff.

- [ ] **Analytics + error reporting** — pick the stack. *Sentry? PostHog? Plausible? Mixpanel?* Once chosen, instrument once feature-complete.

ANSWER: DON'T WORRY ABOUT THIS ONE NOO NEED FOR IT NOW

- [ ] **Bundle / perf budgets** — wire Lighthouse CI or `@next/bundle-analyzer`. *What are the per-route budgets you want enforced (CLAUDE.md mentions ≤ 90 KB on read-only routes — should that be the gate)?*

ANSWER: No CI gate, no Lighthouse CI. Install `@next/bundle-analyzer` and
run it manually before shipping a feature — CLAUDE.md already says "run
`next build` and check the per-route bundle output before declaring a feature
done," and that's the whole policy. If a read-only route blows past ~90 KB,
refactor it then; don't pre-build enforcement infrastructure for a problem
that doesn't exist yet.



## Larger efforts to schedule

- [ ] **Enable TypeScript strict mode** — flip `strict`, `noImplicitAny`, `strictNullChecks` to `true` in `tsconfig.json` and fix the resulting errors. Touches almost every file; warrants a dedicated branch.
- [ ] **Re-enable `@typescript-eslint/no-unused-vars`** — `eslint.config.js:26` disables it. Re-enabling it on a strict-mode pass will catch dead code; do it together with the strict-mode flip.
- [ ] **Type the API client end-to-end** — generate types from the FastAPI OpenAPI schema (`openapi-typescript` or similar) and use them in `src/lib/api/server.ts` and `src/lib/api/client.ts` so each call site is fully typed. Needs backend OpenAPI spec to be stable.
- [ ] **Raise test coverage** — `src/test/example.test.ts` is a placeholder. Cover API client error paths, form validation, guess evaluation, and JWT refresh.
- [ ] **Add e2e tests** — no Playwright/Cypress yet. Start with login → play → submit guess → see result.
- [ ] **CI workflow** — no `.github/workflows/`. After the package manager decision, add a workflow that runs lint, typecheck, vitest, and `pnpm audit` (or `npm audit`).
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
