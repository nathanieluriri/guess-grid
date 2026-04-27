import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GameBoard } from "@/components/game/GameBoard";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { getGameSession } from "@/lib/api/server";
import { isPlayMode, type PlayMode } from "@/lib/api/mock-data";

export const metadata: Metadata = {
  title: "Match",
  description: "Play a focused round of Dead & Injured with tactile drag-and-drop guessing.",
};

export default async function PlayModePage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;

  if (!isPlayMode(mode)) {
    notFound();
  }

  const session = await getGameSession(mode as PlayMode);
  const typedMode = mode as PlayMode;

  if (typedMode === "local" && session.status === "setup") {
    redirect("/play/local/setup");
  }

  if (typedMode === "online" && session.status === "queued") {
    redirect("/play/online/queue");
  }

  if (session.status === "waiting") {
    redirect(`/play/${typedMode}/secret`);
  }

  if (typedMode === "friend" && session.status === "idle") {
    return (
      <PageShell className="max-w-4xl">
        <PageHeader
          eyebrow="Friend challenge"
          title="No active friend match"
          description="Create or accept a challenge from Social, then return here when the backend has a live session ready."
        />
        <section className="section-shell">
          <Link href="/social" className="inline-block">
            <Button className="h-12">Open Social</Button>
          </Link>
        </section>
      </PageShell>
    );
  }

  return <GameBoard mode={typedMode} session={session} />;
}
