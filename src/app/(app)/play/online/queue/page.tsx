import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { OnlineQueueScreen } from "@/components/play/online-queue-screen";
import { getProfilePageData } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Matchmaking",
  description: "Queue for an online Dead & Injured match in a dedicated route.",
};

export default async function OnlineQueuePage() {
  const profile = await getProfilePageData();

  return (
    <PageShell className="max-w-4xl">
      <PageHeader
        eyebrow="Ranked queue"
        title="Finding opponent"
        description="Stay in queue while the backend looks for an online opponent."
      />
      <OnlineQueueScreen user={profile.user} />
    </PageShell>
  );
}
