import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { OnlineQueueScreen } from "@/components/play/online-queue-screen";

export const metadata: Metadata = {
  title: "Matchmaking",
  description: "Queue for an online Dead & Injured match in a dedicated route.",
};

export default function OnlineQueuePage() {
  return (
    <PageShell className="max-w-4xl">
      <PageHeader
        eyebrow="Ranked queue"
        title="Finding opponent"
        description="Queue state now has its own route with its own timer and live transition back into the match shell."
      />
      <OnlineQueueScreen />
    </PageShell>
  );
}
