"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface ModeTileProps {
  href: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** Set to "verified" to require a verified real user, "real" to require any real user, or omit to leave open. */
  gate?: "verified" | "real";
  /** Friendly label for the gate dialog/toast. */
  gateLabel?: string;
}

export function ModeTile({ href, title, subtitle, icon: Icon, gate, gateLabel }: ModeTileProps) {
  const router = useRouter();
  const { requireRealUser, requireVerifiedUser } = useAuth();

  if (!gate) {
    return (
      <Link href={href} className="list-row ring-focus hover:border-border-strong">
        <ModeBody title={title} subtitle={subtitle} Icon={Icon} />
      </Link>
    );
  }

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const ok = gate === "verified" ? requireVerifiedUser(gateLabel) : requireRealUser(gateLabel);
    if (ok) {
      router.push(href);
    }
  };

  return (
    <button type="button" onClick={onClick} className="list-row text-left ring-focus hover:border-border-strong">
      <ModeBody title={title} subtitle={subtitle} Icon={Icon} />
    </button>
  );
}

function ModeBody({ title, subtitle, Icon }: { title: string; subtitle: string; Icon: LucideIcon }) {
  return (
    <>
      <div className="grid size-12 shrink-0 place-items-center rounded-2xl surface-elevated">
        <Icon className="size-5 text-text-secondary" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-base font-semibold">{title}</div>
        <div className="mt-1 truncate text-sm text-text-secondary">{subtitle}</div>
      </div>
      <ArrowRight className="size-4 text-text-tertiary" />
    </>
  );
}
