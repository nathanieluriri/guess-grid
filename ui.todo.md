# Frontend UI Plan

Execution plan for making the Next.js frontend as fast as possible, as beautiful as possible, and mobile-first by default.

This replaces the old wireframe-only audit with a build plan that combines:
- `frontend-design`: distinctive visual direction, deliberate motion, strong hierarchy
- `react-nextjs-patterns`: App Router boundaries, Suspense, server-first data flow
- `tailwind-best-practices`: mobile-first composition, token discipline, reusable patterns
- `gsap-awwwards-website`: use cinematic motion sparingly for hero moments, not everywhere

The app already has a solid token base in [src/index.css](src/index.css), an App Router shell in [src/app](src/app), and shared UI primitives in [src/components/ui](src/components/ui). The main opportunity is to stop treating every screen as a one-off and instead build a fast, coherent mobile system with a sharper visual identity.

---

## Product direction

### Visual thesis
Build the app like a **competitive puzzle lounge**:
- dark, tactile, and precise
- monochrome surfaces with restrained signal color
- editorial typography and dense, confident spacing
- one or two memorable motion moments per screen, never constant motion
- cards should feel carved and layered, not generic SaaS panels

### Non-negotiables
- Mobile-first layouts start at `320px` and scale upward.
- Server Components by default; Client Components only for interaction.
- Keep current color tokens and radius system unless a change is required globally.
- Signal colors remain meaningful, not decorative noise.
- Motion must respect `prefers-reduced-motion`.
- Every screen must feel fast on mid-range mobile devices before desktop polish is added.

### Success criteria
- First content is visible immediately on mobile on all primary routes.
- No route ships unnecessary client JavaScript for static sections.
- Core navigation, dashboard, play mode selection, puzzles, learn, and profile feel visually related.
- Layout shift is near-zero on first load.
- Motion adds atmosphere without delaying interaction.

---

## Architecture rules

### 1. App Router cleanup first
The codebase currently mixes `src/app` routes with legacy-style `src/pages` view components. Keep `src/app` as the routing source of truth and gradually convert `src/pages/*` into route-local server/client components or feature components under `src/components` / `src/features`.

Target structure:
- `src/app/(app)/page.tsx` for the authenticated home dashboard
- `src/app/(app)/play/page.tsx` and nested route groups for configuration / queue / match states
- `src/app/(app)/learn/page.tsx`
- `src/app/(app)/puzzles/page.tsx`
- `src/app/(app)/profile/page.tsx`
- `src/app/(app)/inventory/page.tsx`

This matters for speed because App Router features like streaming, route-level loading states, and server-first rendering only pay off if route boundaries are clean.

### 2. Server-first rendering
Use Server Components for:
- page shells
- dashboard data composition
- puzzle lists
- chapter lists
- profile summaries
- inventory bootstrapping data

Use Client Components only for:
- queue timers
- drag/drop inventory loadout
- sticky CTA behavior
- toggles, tabs, switches, drawers
- optimistic claim / equip interactions
- any GSAP or scroll-linked animation

Rule: if a component can render from props without browser APIs, it should stay server-side.

### 3. Streaming and Suspense
For all high-value pages, stream above-the-fold content first and defer secondary sections.

Examples:
- Home: render header + daily puzzle hero immediately; stream continue strip and daily drop after
- Profile: render identity block immediately; stream recent matches after
- Learn: render page header + continue card first; stream chapter list after
- Puzzles: render header + weekly progress first; stream puzzle rows after

Add route-level `loading.tsx` files with skeletons matching final layout dimensions.

### 4. Data orchestration
Fetch in parallel at the page boundary with `Promise.all`.
Do not chain unrelated awaits in render.
Normalize per-route data loaders in `src/lib/api/server.ts`.

Needed pattern:
- one page-level loader per route
- route component composes sections from one resolved data object
- client islands receive only the subset they need

### 5. Keep client bundles small
- Avoid moving entire pages behind `"use client"`.
- Keep `Navigation`, form widgets, drag/drop, and animated sections isolated.
- Dynamically import heavy client-only blocks if not above the fold.
- Do not attach React Query where server rendering and direct refresh are enough.

Use React Query only where live client revalidation is genuinely needed.

---

## Design system plan

### 1. Typography upgrade
Current layout uses `Inter`, which is functional but too generic for the target look. Move to a more intentional pairing:
- display/headings: something with character and compression
- body/UI: highly readable grotesk or text face
- mono: keep `JetBrains Mono`

Constraints:
- Use `next/font` only
- ship one display family and one text family max
- subset aggressively
- use `display: "swap"`

Typography goals:
- stronger page titles
- tighter line lengths
- more contrast between metadata, labels, and primary content
- tabular numerals for scores, streaks, timers, ratings

### 2. Token discipline
Keep the existing HSL token system in [src/index.css](src/index.css), but add a small layer of semantic utilities instead of ad hoc classes everywhere:
- `page-shell`
- `section-shell`
- `hero-card`
- `stat-card`
- `list-row`
- `pill-chip`
- `tier-badge`
- `rank-ring`

Do not introduce random one-off gray values in components.

### 3. Mobile spacing system
Adopt consistent mobile paddings:
- page gutters: `px-4`
- section gaps: `gap-4` / `gap-5`
- card padding: `p-4`
- hero padding: `p-5`
- desktop enhancements only at `md` and `lg`

Avoid desktop-first layouts that shrink badly. Build the narrow version first, then expand.

### 4. Surface language
All core screens should share these traits:
- layered dark surfaces
- subtle border contrast
- occasional inset panels for hierarchy
- one premium highlight treatment per screen
- restrained shadows, not soft SaaS blur everywhere

Use grain, ring, and gradient accents only on:
- home hero
- matchmaking center stage
- progress treatments
- profile rank ring

### 5. Motion language
Motion system:
- entrance: short upward reveal and fade
- emphasis: pulse or shimmer for one object only
- interaction: tight 120–180ms feedback
- scroll-linked animation: reserved for the home hero or onboarding-like reveal sections only

Do not animate every card on every render.
If GSAP is introduced, it should be isolated to one or two marquee sections and loaded only on the client.

---

## Route plan

## 1. Home dashboard
Route: `src/app/(app)/page.tsx`

Goal:
Make `/` the emotional center of the app instead of redirecting to `/play`.

Above the fold on mobile:
- greeting
- coin pill and streak chip
- daily puzzle hero
- single primary CTA

Below the fold:
- continue strip
- daily drop
- compact shortcuts to Play, Learn, Puzzles, Me

Performance rules:
- Server Component page
- stream continue strip separately
- claim button is a tiny client island
- horizontal strip must use native overflow + scroll snap, not a JS carousel unless profiling proves a need

Design rules:
- make the daily puzzle hero the memorable visual moment
- use layered tiles, a refined glow/ring, and confident typography
- keep copy short and sharp

## 2. Play mode picker
Route: `src/app/(app)/play/page.tsx`

Goal:
Turn Play into a fast decision screen, not a marketing page.

Design:
- stacked mode rows on mobile
- one icon, one title, one subtitle, one chevron
- no oversized promo blocks

Performance:
- fully server-rendered shell
- no client state unless a live queue count or availability indicator is added

## 3. Match configuration routes
Routes:
- `src/app/(app)/play/bot/configure/page.tsx`
- `src/app/(app)/play/local/setup/page.tsx`
- future friend/private variants

Goal:
Remove setup complexity from `GameBoard`.

Rules:
- client-only form state lives here, nowhere else
- persist config in URL params or a compact session payload
- sticky bottom CTA on mobile
- keep controls large and thumb-friendly

## 4. Matchmaking queue
Route: `src/app/(app)/play/online/queue/page.tsx`

Goal:
Make waiting feel premium instead of dead time.

Design:
- central avatar disc
- restrained concentric pulse rings
- live timer
- pool/rating/range strip
- equipped power-up strip

Performance:
- isolate timer and queue updates to a small client component
- keep the rest static
- use CSS keyframes first; only use GSAP if a more complex sequence is truly necessary

## 5. Active match shell
Primary component: [src/components/game/GameBoard.tsx](src/components/game/GameBoard.tsx)

Goal:
Reduce this component to one responsibility: active play.

Remove from this file:
- setup flow
- queued state
- waiting/secret-entry state
- any non-match placeholder screen

Expected result:
- smaller component surface
- lower rerender risk
- easier testing
- cleaner mobile layout tuning

## 6. Learn
Route: `src/app/(app)/learn/page.tsx`

Goal:
Add momentum and readability.

Add:
- continue lesson hero at top
- clear chapter progress framing
- circular left-side status markers

Performance:
- Server Component page
- chapter list can stream separately if needed

Design:
- current chapter should feel active through line weight and ring treatment, not bright color spam

## 7. Puzzles
Route: `src/app/(app)/puzzles/page.tsx`

Goal:
Make puzzle progression feel collectible and ranked.

Add:
- weekly progress card
- rating chip
- sticky daily puzzle row
- stronger tier hierarchy

Performance:
- server-render list rows
- keep filters lightweight if added later

## 8. Daily puzzle
Route: `src/app/(app)/puzzles/daily/page.tsx`

Goal:
Give the daily challenge its own identity and re-entry path.

Must include:
- “Today” framing
- streak context
- clean completion/share state

## 9. Profile
Route: `src/app/(app)/profile/page.tsx`

Goal:
Make profile feel like status, not settings.

Core blocks:
- rank ring avatar
- tier and currency summary
- six-stat grid
- recent matches
- settings action

Remove:
- full inventory section from profile page

## 10. Inventory
Route: `src/app/(app)/inventory/page.tsx`

Goal:
Make power-ups feel organized, tactile, and collectible.

Needs:
- equipped strip
- filter tabs
- dense mobile grid
- large tap targets

Performance:
- server-render initial inventory
- client island for filtering and equip interactions only

---

## Shared component work

Build these once and reuse them everywhere:

### Priority A primitives
- `TierBadge`
- `RarityDot`
- `RankRing`
- `ProgressBar`
- `SectionHeader`
- `ListRow`
- `StatCard`

### Priority B mobile patterns
- `StickyBottomAction`
- `ContinueStrip`
- `HeroCard`
- `EmptySlotTile`
- `PageHeader`

### Priority C feedback/loading
- route-matched skeletons
- optimistic button state
- empty states that preserve layout rhythm

Rules:
- primitives must accept `className`
- avoid over-abstracting variants too early
- use `cn()` consistently
- keep accessibility labels explicit

---

## Performance checklist

### Rendering
- Prefer Server Components by default.
- Push `"use client"` to leaf components.
- Keep Suspense boundaries near slow sections, not around entire pages.
- Parallelize all independent page fetches.

### JavaScript
- Remove dead UI states from large client components.
- Lazy-load optional heavy interactions.
- Avoid global client providers unless they are truly global.
- Profile before adding memoization; do not scatter `useMemo`/`useCallback` by habit.

### CSS and Tailwind
- Stay mobile-first in class ordering and layout logic.
- Reuse semantic utility classes for repeated patterns.
- Avoid long unreadable class soup in page files when a repeated component should exist.
- Prefer CSS transforms and opacity for motion.

### Fonts and media
- Use `next/font` with minimal families and subsets.
- Prefer SVG or CSS effects over heavy bitmap decoration.
- Ensure all images use `next/image` when they are real content images.

### Navigation and loading
- Add `loading.tsx` for route groups that fetch real data.
- Use optimistic transitions only when they improve feel without masking slow architecture.
- Preserve scroll position intentionally for strips and lists.

### Accessibility and motion
- Respect `motion-reduce`.
- Ensure touch targets are at least comfortable on mobile.
- Preserve contrast on dark surfaces.
- Keyboard access must remain intact for all interactive controls.

---

## Execution order

### Phase 1: foundation
- Clean up route ownership between `src/app` and `src/pages`
- choose final font pairing
- add shared primitives and utility classes
- define page/header/card/list patterns

### Phase 2: visible wins
- build Home dashboard
- simplify Play
- revamp Learn
- revamp Puzzles
- revamp Profile

### Phase 3: flow cleanup
- extract Inventory
- split setup/queue/waiting states out of `GameBoard`
- build configure routes
- build matchmaking route

### Phase 4: quality pass
- add streaming boundaries and skeletons
- trim client bundles
- refine motion
- verify mobile spacing and safe-area behavior
- run performance checks on real route transitions

---

## Definition of done

The plan is complete when:
- `/` is a real dashboard
- primary routes are mobile-first and visually coherent
- route shells render mostly on the server
- `GameBoard` only handles active play
- profile and puzzles feel premium instead of utilitarian
- queue/config/inventory flows are separate, focused screens
- animation is intentional and lightweight
- the app looks distinctive without sacrificing load speed or clarity
