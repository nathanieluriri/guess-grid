"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry, SocialFriend } from "@/lib/api/mock-data";
import { apiRequest } from "@/lib/api/client";
import { ProfileMedia } from "@/components/profile/ProfileMedia";

export function SocialScreen({
  friends,
  leaders,
}: {
  friends: SocialFriend[];
  leaders: LeaderboardEntry[];
}) {
  const [tab, setTab] = useState<"friends" | "leaderboard">("friends");

  async function challengeFriend(friend: SocialFriend) {
    const response = await apiRequest<{ game_id: string }>(`/friends/${friend.id}/challenge`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    if (response.error) {
      toast.error("Challenge failed", { description: response.error });
      return;
    }
    toast("Challenge queued", {
      description: `Private game ${response.data?.game_id ?? ""} is ready for ${friend.name}.`,
    });
  }

  return (
    <PageShell className="max-w-5xl">
      <PageHeader
        eyebrow="Community"
        title="Social"
        description="Track friends, send private challenges, and keep an eye on the live leaderboard."
      />

      <div className="inline-flex rounded-2xl border border-border surface p-1">
        {(["friends", "leaderboard"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm capitalize transition ring-focus",
              tab === value ? "bg-foreground text-background" : "text-text-secondary",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      {tab === "friends" ? (
        <section className="space-y-3">
          {friends.length === 0 ? (
            <div className="section-shell py-10 text-center">
              <p className="text-sm text-text-secondary">No friends yet</p>
              <p className="mt-1 text-xs text-text-tertiary">When you add friends, challenge them to private matches right here.</p>
            </div>
          ) : (
            friends.map((friend) => (
            <div key={friend.id} className="list-row">
              <div className="relative">
                <ProfileMedia
                  src={friend.profile_media_url}
                  kind={friend.profile_media_kind}
                  initials={friend.name.slice(0, 2).toUpperCase()}
                  size={44}
                />
                <span
                  className={cn(
                    "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[hsl(var(--bg-base))]",
                    friend.online ? "bg-[hsl(var(--signal-dead))]" : "bg-text-tertiary",
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{friend.name}</div>
                <div className="mt-1 text-xs text-text-secondary">{friend.status}</div>
              </div>
              <button
                type="button"
                onClick={() => challengeFriend(friend)}
                className="pill-chip"
              >
                Challenge
              </button>
            </div>
            ))
          )}
        </section>
      ) : (
        <section className="section-shell overflow-hidden p-0">
          {leaders.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-text-secondary">Leaderboard is warming up</p>
              <p className="mt-1 text-xs text-text-tertiary">Play ranked matches to claim a spot on the board.</p>
            </div>
          ) : (
            leaders.map((leader) => (
            <div key={leader.rank} className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-0">
              <span className="w-8 font-mono text-sm text-text-tertiary">#{leader.rank}</span>
              <ProfileMedia
                src={leader.profile_media_url}
                kind={leader.profile_media_kind}
                initials={leader.name.slice(0, 2).toUpperCase()}
                size={32}
              />
              <span className="flex-1 text-sm font-medium">{leader.name}</span>
              <span className="font-mono font-semibold">{leader.wins}</span>
            </div>
            ))
          )}
        </section>
      )}
    </PageShell>
  );
}
