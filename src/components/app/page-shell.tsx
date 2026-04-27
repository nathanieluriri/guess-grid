import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("page-shell", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-2">
        {eyebrow ? (
          <div className="text-[11px] uppercase tracking-[0.28em] text-text-tertiary">{eyebrow}</div>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-3xl leading-none sm:text-4xl">{title}</h1>
          {description ? <p className="max-w-2xl text-sm leading-6 text-text-secondary">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-tertiary">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("stat-card", className)}>
      <div className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">{label}</div>
      <div className="mt-2 font-mono text-xl font-semibold leading-none">{value}</div>
      {hint ? <div className="mt-2 text-xs text-text-secondary">{hint}</div> : null}
    </div>
  );
}
