import { Outlet } from "react-router-dom";
import { TopBar, MobileTabs, DesktopRail } from "./Navigation";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <div className="flex flex-1 w-full">
        <DesktopRail />
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileTabs />
    </div>
  );
}
