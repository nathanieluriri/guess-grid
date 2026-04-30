import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { ProfileMediaUploader } from "@/components/profile/ProfileMediaUploader";
import { getProfilePageData } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Profile settings",
  description: "Update your profile media and preferences.",
};

export default async function ProfileSettingsPage() {
  const data = await getProfilePageData();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Settings"
        title="Profile"
        description="Manage how other players see you in matches and on leaderboards."
        action={
          <Link
            href="/profile"
            className="inline-flex h-9 items-center gap-2 rounded-lg surface-elevated px-3 text-xs font-medium ring-focus hover:border-border-strong"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>Back</span>
          </Link>
        }
      />

      <ProfileMediaUploader
        initials={data.user.initials}
        currentUrl={data.user.profile_media_url ?? data.user.avatar_url}
        currentKind={data.user.profile_media_kind ?? "image"}
      />
    </PageShell>
  );
}
