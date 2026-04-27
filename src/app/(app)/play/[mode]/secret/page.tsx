import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { SecretSetupScreen } from "@/components/play/secret-setup-screen";
import { getGameSession } from "@/lib/api/server";
import { isPlayMode, type PlayMode } from "@/lib/api/mock-data";

export const metadata: Metadata = {
  title: "Secret Setup",
  description: "Submit your secret before the active Dead & Injured match begins.",
};

export default async function SecretPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;

  if (!isPlayMode(mode)) {
    notFound();
  }

  const typedMode = mode as PlayMode;
  const session = await getGameSession(typedMode);

  if (session.status !== "waiting") {
    redirect(`/play/${typedMode}`);
  }

  return (
    <PageShell className="max-w-4xl">
      <PageHeader
        eyebrow="Secret setup"
        title="Lock in your code"
        description="Submit your 4-digit secret. The live match opens as soon as both sides are ready."
      />
      <SecretSetupScreen mode={typedMode} sessionId={session.id} />
    </PageShell>
  );
}
