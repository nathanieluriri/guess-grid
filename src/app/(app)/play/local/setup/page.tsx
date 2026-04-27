import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { LocalSetupScreen } from "@/components/play/local-setup-screen";

export const metadata: Metadata = {
  title: "Local Setup",
  description: "Prepare a pass-and-play match before entering the board.",
};

export default function LocalSetupPage() {
  return (
    <PageShell className="max-w-4xl">
      <PageHeader
        eyebrow="Pass & Play"
        title="Local setup"
        description="Enter both secrets here before the active match shell loads."
      />
      <LocalSetupScreen />
    </PageShell>
  );
}
