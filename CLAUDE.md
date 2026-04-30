# CLAUDE.md — Frontend (Dead & Injured)

This file is loaded into Claude's context for every conversation in this
directory. It encodes the **design system** and the **Next.js ideology**
this project commits to. Apply both when writing new code AND when editing
existing code.

---

## 1. Design system — non-negotiable

The look is **dark, monochromatic, calm, focused**. Source of truth:
`src/index.css` (HSL design tokens) + `tailwind.config.ts`. Do not
introduce new colours, new font families, new shadow scales, new radii,
or new motion curves unless explicitly asked.

### Visual identity

- **Mode**: dark by default (`<html class="dark">`). Light mode tokens
  exist for completeness; do not redesign the dark palette.
- **Palette**: monochrome surfaces (`--bg-base`, `--bg-surface`,
  `--bg-elevated`, `--bg-inset`) + a single inverted accent
  (`--accent` / `--accent-foreground`). The only chromatic colours are
  **functional signals**:
  - `--signal-dead` (green) — correct digit, correct position.
  - `--signal-injured` (orange) — correct digit, wrong position.
  - `--signal-danger` (red) — destructive only.
  Never use these for decoration.
- **Typography**:
  - UI text: **Inter**, with `cv11` and `ss01` font features on.
  - Numerals / code / digit tiles: **JetBrains Mono**, `tabular-nums`.
  - Headings: `tracking-tight`, weight 650.
- **Radius**: `--radius: 0.75rem`. Stick to `rounded-xl` / `rounded-2xl`.
- **Borders**: `--border-subtle` for resting, `--border-strong` for
  active/hover. Borders are 1px (2px only on dashed `guess-slot`).
- **Shadows**: four steps — `--shadow-sm`, `--shadow-md`, `--shadow-lg`,
  `--shadow-drag`. The drag shadow is reserved for actively-dragged tiles.
- **Motion**: 120ms by default with `--ease-standard`; entrances use
  `--ease-entrance` (`cubic-bezier(0.22, 1, 0.36, 1)`).
- **Reduced motion**: respected globally via `@media (prefers-reduced-motion)`.
  Don't override.

### Token usage rules

- **Use the semantic tokens, not raw HSL.** Tailwind classes like
  `bg-background`, `text-foreground`, `bg-card`, `border`, `text-muted`,
  `surface`, `surface-elevated`, `surface-inset` already map to them.
  - ✅ `<div className="surface-elevated rounded-2xl border">`
  - ❌ `<div style={{ background: "#1a1a1d" }}>`
- For colours that don't have a Tailwind alias, use the CSS var pattern:
  `bg-[hsl(var(--bg-surface))]` — never hex/rgb literals.
- Use the `.digit-tile` and `.guess-slot` component classes for game
  pieces — they already encode the hover/elimination/drag states.
- Use `ring-focus` utility for focus rings (consistent across the app).
- Add new keyframes only if you can't compose existing ones; if you do,
  put them in the `@keyframes` block at the bottom of `index.css`.

### Component conventions

- Built on **shadcn/ui** (see `src/components/ui/`). Prefer composing
  these primitives over hand-rolling. If a primitive is missing, add it
  via the shadcn CLI rather than inventing a parallel component.
- **Lucide** for all icons. Don't mix icon libraries.
- Use `cn()` from `@/lib/utils` to merge class names.
- Layout is built around three regions defined in `AppLayout`:
  `TopBar` (header), `DesktopRail` (left nav, ≥ lg), `MobileTabs`
  (bottom nav, < lg). Don't add a fourth.
- Game components live in `src/components/game/` and must remain
  drag-friendly (dnd-kit) — never replace with native HTML5 DnD.

### Copy / voice

Terse, lowercase-leaning, calm. No emoji in UI copy. Match the existing
register (e.g. "vs Bot", "In ranked queue", "Last seen 12m ago").

---

## 2. Next.js ideology — apply when writing code

We are migrating from Vite SPA → Next.js App Router. The migration
*reason* — keep this in mind on every code decision:

> **SSR / RSC benefits** —
> - First paint is real HTML, not a spinner. Big win for `/learn`,
>   `/leaderboard`, `/profile/:user`, and `/puzzles` (mostly read-only).
> - SEO + link previews actually work (currently `<meta>` is empty).
> - Server Components let us call the FastAPI backend on the server with
>   no token round-trip from the browser, fewer waterfalls, and less JS
>   shipped to the client.
> - Streaming + Suspense lets the shell paint while data resolves.
> - Server Actions can replace some POST forms (Profile edit, friend
>   request, puzzle submit) without a client-side mutation library.
>
> Keep this list in mind when deciding "Server Component" vs `"use client"`.

### Default to Server Components

Every new file under `app/` is a Server Component **unless it must be a
Client Component**. A file must be `"use client"` only if it:

- uses React hooks (`useState`, `useEffect`, `useReducer`, `useRef`,
  `useContext` — anything `use*`),
- attaches event handlers (`onClick`, `onChange`, `onSubmit`, …),
- uses browser-only APIs (`window`, `document`, `localStorage`,
  `IntersectionObserver`, dnd-kit, drag/drop, audio, canvas),
- consumes a Context provider that's only available on the client
  (React Query, Tooltip, Toaster).

If none of those apply, leave it as a Server Component. Push interactivity
**down the tree** into the smallest possible client island.

### Patterns to reach for

- **Server Component fetches data, passes plain props to a client
  child.** Don't lift state up into the client just because one button
  is interactive.
  ```tsx
  // app/profile/page.tsx — Server Component
  const profile = await api.users.me();
  return <ProfileShell profile={profile}><EditButton /></ProfileShell>;
  ```
- **Use `redirect()` from `next/navigation`** for server-side redirects
  (e.g. `app/page.tsx` → `/play`). Never render a `<Navigate>` shim.
- **Use `next/link` for navigation** (`href=`, not `to=`). Never `<a>`
  for internal routes.
- **Use `next/image` for images** in `public/`. Never raw `<img>`.
- **Use `next/font/google`** for Inter + JetBrains Mono. No `<link>` to
  fonts.googleapis in `<head>`.
- **Per-route `metadata`** (`export const metadata = {...}`) on every
  `page.tsx` — title, description, OpenGraph. The current SPA has
  none; that's a regression we're explicitly fixing.
- **Loading states** go in `app/<route>/loading.tsx` (streamed
  fallbacks), not in component-local spinners.
- **Error boundaries** go in `app/<route>/error.tsx` (must be a client
  component).
- **Read-only data** → fetch in the Server Component with
  `fetch(url, { next: { revalidate: 60 } })` for ISR or
  `{ cache: "no-store" }` for per-request data. **No React Query needed.**
- **Mutations + live data** (in-game guesses, friend requests,
  inventory changes) → React Query on the client side. Mount its
  provider once in `app/providers.tsx`.
- **Simple POST forms** (Profile edit, friend request, puzzle submit)
  → **Server Actions**. Don't reach for React Query for a form that
  posts once and reloads.

### Patterns to avoid

- ❌ Marking a whole page `"use client"` because one button needs an
  `onClick`. Extract the button.
- ❌ Putting `"use client"` at the top of a layout. Layouts should
  almost always be Server Components; their children can be client.
- ❌ Calling the FastAPI backend from a Client Component when a Server
  Component could do it (extra round-trip + leaks token if you're not
  careful).
- ❌ Storing the auth token in `localStorage`. Use HTTP-only secure
  cookies, set via Next Route Handlers (`app/api/auth/*`).
- ❌ Spinner-as-first-paint. If the data is fetchable on the server,
  fetch it on the server.
- ❌ Importing `react-router-dom` anywhere. After migration this
  package is removed.
- ❌ `useEffect` to fetch on mount. Either fetch on the server, or use
  React Query — never a raw effect.
- ❌ New `<head>`-tag wrappers (no `react-helmet`, no `next/head` in
  the App Router). Use the `metadata` export.

### Performance budget

- Server-rendered (read-only) routes — `/learn`, `/social`,
  `/profile`, `/puzzles` — target **≤ 90 KB** of client JS.
- Lighthouse Performance ≥ **95** on those routes.
- Use `<Suspense>` to stream slow data so the shell paints fast.
- Run `next build` and check the per-route bundle output before
  declaring a feature done.

### File / folder layout (target)

```
src/
  app/
    layout.tsx              # <html>/<body>, font, metadata, providers
    providers.tsx           # "use client" — QueryClient, Tooltip, Toaster
    page.tsx                # redirect("/play")
    not-found.tsx
    (app)/                  # route group — shares the AppLayout chrome
      layout.tsx            # TopBar / DesktopRail / MobileTabs
      play/page.tsx
      play/[mode]/page.tsx
      game/page.tsx         # redirects to /play/[mode]
      puzzles/page.tsx
      learn/page.tsx
      practice/page.tsx
      social/page.tsx
      profile/page.tsx
    api/
      auth/login/route.ts
      auth/signup/route.ts
      auth/logout/route.ts
      auth/refresh/route.ts
  components/               # shared UI (server-safe by default)
    ui/                     # shadcn primitives
    game/                   # client-only (dnd-kit lives here)
  lib/
    api/                    # typed fetch wrapper + per-resource modules
    game.ts                 # local fallback only (practice mode)
    utils.ts
  middleware.ts             # gates protected routes
```

### Auth & API conventions

- All API calls go through `src/lib/api/client.ts` — a single typed
  fetch wrapper. Never call `fetch("http://...")` ad-hoc in a
  component.
- The base URL is hardcoded to `https://game-api.visichek.app/api/v1`
  (`API_BASE_URL` constant in `client.ts`). No env vars, no `.env.local`.
  Edit the constant if you need a different backend.
- It reads the JWT from the HTTP-only cookie via `cookies()` (server)
  or relies on the cookie being sent automatically (client, with
  `credentials: "include"`).
- Backend responses are wrapped in `APIResponse<T>` (`status_code`,
  `data`, `detail`). The wrapper unwraps `.data` and throws on non-2xx.

---

## 3. House style

- **Don't add comments that restate the code.** Add a comment only when
  the *why* is non-obvious.
- **Don't add backwards-compat shims** during the Next.js migration —
  if a file is being moved, move it; don't leave a re-export at the old
  path.
- **No emoji in source files** unless the user asks for them.
- **Tests**: keep vitest. Place new tests next to the file under test
  or in `src/test/`. After migration, run them under the Next plugin
  (or move to `next/jest`).
- **Lint**: `next lint` (or `eslint .` until then). Fix before commit.

---

## 4. When in doubt

- Visual change? Re-read §1 and pull from `src/index.css` tokens.
- New page? Default to Server Component, add `metadata`, fetch on the
  server, push interactivity to a small client child (§2).
- New API call? Add it to `src/lib/api/<resource>.ts`, never inline.
- Auth-protected route? Add it to the `middleware.ts` matcher.
- Stuck between SSR and CSR? Pick SSR. We're doing this migration
  *for* the SSR benefits — when the choice is close, we choose SSR.
