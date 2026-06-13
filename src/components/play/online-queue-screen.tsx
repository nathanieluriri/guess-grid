"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { apiRequest, buildApiUrl } from "@/lib/api/client";
import { ProfileMedia } from "@/components/profile/ProfileMedia";
import type { ProfileSummary } from "@/lib/api/mock-data";

interface OnlineQueueScreenProps {
  user: Pick<
    ProfileSummary,
    | "username"
    | "wins"
    | "rankLabel"
    | "initials"
    | "avatar_url"
    | "profile_media_url"
    | "profile_media_kind"
  >;
}

interface Blip {
  id: number;
  x: number;
  y: number;
}

const BLIP_LIFETIME_MS = 2400;
const BLIP_MIN_GAP_MS = 900;
const BLIP_MAX_JITTER_MS = 1400;

export function OnlineQueueScreen({ user }: OnlineQueueScreenProps) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [blips, setBlips] = useState<Blip[]>([]);
  const blipIdRef = useRef(0);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let spawnTimeout: number | undefined;
    const removalTimeouts = new Set<number>();

    const spawn = () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 56 + Math.random() * 70;
      const id = ++blipIdRef.current;
      const blip: Blip = {
        id,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
      setBlips((prev) => [...prev, blip]);

      const removalId = window.setTimeout(() => {
        setBlips((prev) => prev.filter((b) => b.id !== id));
        removalTimeouts.delete(removalId);
      }, BLIP_LIFETIME_MS);
      removalTimeouts.add(removalId);

      spawnTimeout = window.setTimeout(spawn, BLIP_MIN_GAP_MS + Math.random() * BLIP_MAX_JITTER_MS);
    };

    spawnTimeout = window.setTimeout(spawn, 600);
    return () => {
      if (spawnTimeout) window.clearTimeout(spawnTimeout);
      removalTimeouts.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    let closed = false;
    let source: EventSource | null = null;
    let attempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const goToMatch = () => {
      if (closed) return;
      closed = true;
      source?.close();
      router.push("/play/online");
      router.refresh();
    };

    const connect = () => {
      if (closed) return;
      source = new EventSource(buildApiUrl("/games/matchmaking/stream"), { withCredentials: true });
      source.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as
            | { type: "match_found"; match_id: string }
            | { type: "snapshot"; status: { status: string; match_id?: string | null } };
          if (payload.type === "match_found" || (payload.type === "snapshot" && payload.status.status === "matched")) {
            goToMatch();
          }
        } catch {
          /* ignore keep-alive / malformed frames */
        }
      };
      source.onerror = () => {
        source?.close();
        if (closed) return;
        attempts += 1;
        // Reconnect with backoff; the poll below is the safety net meanwhile.
        reconnectTimer = setTimeout(connect, Math.min(1000 * 2 ** Math.min(attempts, 4), 15000));
      };
    };

    // Fallback poll in case the stream can't be established at all.
    const poll = setInterval(async () => {
      if (closed) return;
      const status = await apiRequest<{ status: string; match_id?: string | null }>("/games/matchmaking/status");
      if (status.data?.status === "matched") goToMatch();
    }, 5000);

    connect();
    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(poll);
      source?.close();
    };
  }, [router]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");

  async function cancelQueue() {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      await apiRequest("/games/matchmaking/queue", { method: "DELETE" });
    } finally {
      router.push("/play");
      router.refresh();
    }
  }

  return (
    <section className="hero-card">
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="relative grid h-64 w-64 place-items-center sm:h-72 sm:w-72">
          <div className="absolute h-56 w-56 rounded-full border border-border/40" />
          <div className="absolute h-40 w-40 rounded-full border border-border/30" />

          <div className="pulse-ring absolute h-24 w-24 rounded-full border border-border-strong" />
          <div className="pulse-ring pulse-ring-2 absolute h-24 w-24 rounded-full border border-border-strong" />
          <div className="pulse-ring pulse-ring-3 absolute h-24 w-24 rounded-full border border-border-strong" />

          {blips.map((blip) => (
            <div
              key={blip.id}
              className="absolute z-10"
              style={{
                top: `calc(50% + ${blip.y}px - 0.875rem)`,
                left: `calc(50% + ${blip.x}px - 0.875rem)`,
              }}
            >
              <div className="radar-blip h-7 w-7 rounded-full border border-border-strong bg-elevated shadow-md" />
            </div>
          ))}

          <div className="relative z-20 grid size-20 place-items-center rounded-full border border-border-strong surface shadow-md">
            <ProfileMedia
              src={user.profile_media_url ?? user.avatar_url ?? null}
              kind={user.profile_media_kind ?? null}
              initials={user.initials}
              size={56}
              alt={`${user.username} avatar`}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">Finding opponent</h2>
          <p className="text-sm text-text-secondary">
            Ranked · 4 digits ·{" "}
            <span className="font-mono tabular-nums">
              {minutes}:{remainder}
            </span>
          </p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">
            Queueing as {user.username}
          </p>
        </div>

        <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
          <div className="stat-card">
            <div className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">Wins</div>
            <div className="mt-2 font-mono text-xl font-semibold tabular-nums">{user.wins}</div>
          </div>
          <div className="stat-card">
            <div className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">Rank</div>
            <div className="mt-2 text-lg font-semibold">{user.rankLabel}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={cancelQueue}
          disabled={isCancelling}
          className="pill-chip ring-focus disabled:opacity-60"
        >
          <ArrowLeft className="size-4" />
          {isCancelling ? "Leaving queue..." : "Cancel queue"}
        </button>
      </div>
    </section>
  );
}
