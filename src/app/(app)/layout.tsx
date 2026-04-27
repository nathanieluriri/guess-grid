import { DesktopRail, MobileTabs, TopBar } from "@/components/Navigation";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <div className="flex flex-1 w-full">
        <DesktopRail />
        <main className="flex-1 min-w-0 pb-24 lg:pb-0">{children}</main>
      </div>
      <MobileTabs />
    </div>
  );
}
