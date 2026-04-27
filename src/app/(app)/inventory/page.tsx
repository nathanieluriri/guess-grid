import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { PowerUpTile } from "@/components/game/PowerUpTile";
import { getInventoryPageData } from "@/lib/api/server";
import type { Category } from "@/lib/game";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Review power-ups, filter your collection, and manage the next-match loadout.",
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "offensive", label: "Offensive" },
  { value: "defensive", label: "Defensive" },
  { value: "meta", label: "Meta" },
  { value: "owned", label: "Owned" },
] as const;

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const [{ inventory, loadout }, resolvedSearchParams] = await Promise.all([getInventoryPageData(), searchParams]);
  const selectedFilter = resolvedSearchParams.filter ?? "all";
  const filtered = inventory.filter((powerUp) => {
    if (selectedFilter === "owned") return powerUp.count > 0;
    if (selectedFilter === "all") return true;
    return powerUp.category === (selectedFilter as Category);
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Loadout"
        title="Inventory"
        description={`${inventory.length} power-ups · ${inventory.reduce((total, item) => total + item.count, 0)} total items`}
      />

      <section className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={filter.value === "all" ? "/inventory" : `/inventory?filter=${filter.value}`}
              className={cn("pill-chip whitespace-nowrap", selectedFilter === filter.value && "border-border-strong text-foreground")}
            >
              {filter.label}
            </Link>
          ))}
        </div>

        <div className="section-shell">
          <div className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">Equipped · next match</div>
          <div className="mt-4 flex gap-3">
            {Array.from({ length: 3 }).map((_, index) => {
              const item = loadout[index];
              return item ? (
                <PowerUpTile key={item.id} powerUp={item} showRarityDot size="md" />
              ) : (
                <div key={index} className="guess-slot size-12 rounded-2xl text-text-tertiary" data-filled="false">
                  <Plus className="size-4" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((powerUp) => (
            <div key={powerUp.id} className="section-shell p-3">
              <PowerUpTile powerUp={powerUp} showRarityDot size="md" />
              <div className="mt-3 text-sm font-semibold leading-tight">{powerUp.name}</div>
              <div className="mt-1 text-xs leading-5 text-text-secondary">{powerUp.description}</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
