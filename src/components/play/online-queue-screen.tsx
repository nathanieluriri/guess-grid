"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buildApiUrl } from "@/lib/api/client";

export function OnlineQueueScreen() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(buildApiUrl("/games/matchmaking/stream"), { withCredentials: true });
    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data) as
        | { type: "match_found"; match_id: string }
        | { type: "snapshot"; status: { status: string; match_id?: string | null } };

      if (payload.type === "match_found" || (payload.type === "snapshot" && payload.status.status === "matched")) {
        eventSource.close();
        router.push("/play/online");
        router.refresh();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [router]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");

  return (
    <section className="hero-card">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="relative grid size-28 place-items-center rounded-full border border-border bg-elevated">
          <div className="pulse-ring absolute inset-3 rounded-full border border-border-strong" />
          <div className="pulse-ring pulse-ring-2 absolute inset-3 rounded-full border border-border-strong" />
          <div className="relative z-10 grid size-16 place-items-center rounded-full bg-foreground font-mono text-sm font-semibold text-background">
            D&I
          </div>
        </div>
        <div>
          <div className="text-xl font-semibold">Finding opponent</div>
          <div className="mt-1 text-sm text-text-secondary">Ranked · 4 digits · {minutes}:{remainder}</div>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-3">
          <div className="stat-card">
            <div className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">Pool</div>
            <div className="mt-2 font-mono text-xl font-semibold">1,834</div>
          </div>
          <div className="stat-card">
            <div className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">Rating</div>
            <div className="mt-2 font-mono text-xl font-semibold">1,240</div>
          </div>
          <div className="stat-card">
            <div className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">Range</div>
            <div className="mt-2 font-mono text-xl font-semibold">±80</div>
          </div>
        </div>
        <button type="button" onClick={() => router.push("/play")} className="pill-chip">
          <ArrowLeft className="size-4" />
          Cancel
        </button>
      </div>
    </section>
  );
}
