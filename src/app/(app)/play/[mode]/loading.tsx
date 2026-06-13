// Board-shaped fallback streamed while the server creates / fetches the match
// session. Mirrors the GameBoard layout so the shell doesn't visibly jump.
export default function MatchLoading() {
  return (
    <div className="container max-w-6xl py-4 sm:py-6 space-y-4" aria-busy="true" aria-label="Loading match">
      {/* opponent header */}
      <div className="rounded-2xl surface border border-border p-3 sm:p-4 flex items-center justify-between gap-3">
        <div className="size-9 rounded-lg surface-elevated border border-border animate-pulse" />
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="size-10 rounded-full surface-elevated border border-border animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 rounded surface-elevated border border-border animate-pulse" />
            <div className="h-2.5 w-20 rounded surface-elevated border border-border animate-pulse" />
          </div>
        </div>
        <div className="space-y-1.5 text-right">
          <div className="h-2.5 w-12 rounded surface-elevated border border-border animate-pulse ml-auto" />
          <div className="h-4 w-8 rounded surface-elevated border border-border animate-pulse ml-auto" />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          {/* history */}
          <div className="rounded-2xl surface-elevated border border-border p-3 sm:p-4 min-h-[180px] space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-xl surface border border-border animate-pulse" />
            ))}
          </div>

          {/* status line */}
          <div className="h-9 rounded-lg surface border border-border animate-pulse" />

          {/* slots */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="size-14 sm:size-16 rounded-xl border-2 border-dashed border-border animate-pulse" />
            ))}
          </div>

          {/* tray */}
          <div className="rounded-2xl surface border border-border p-3">
            <div className="flex justify-between gap-1.5 sm:gap-2">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="size-12 flex-1 rounded-lg surface-elevated border border-border animate-pulse" />
              ))}
            </div>
          </div>

          {/* submit */}
          <div className="h-12 rounded-md surface-elevated border border-border animate-pulse" />
        </div>

        <aside className="hidden lg:flex flex-col gap-4">
          <div className="h-40 rounded-2xl surface border border-border animate-pulse" />
          <div className="h-36 rounded-2xl surface border border-border animate-pulse" />
        </aside>
      </div>
    </div>
  );
}
