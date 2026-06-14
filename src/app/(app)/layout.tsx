import { redirect } from "next/navigation";
import { DesktopRail, MobileTabs, TopBar } from "@/components/Navigation";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { NavProgress } from "@/components/app/nav-progress";
import { getCurrentUser } from "@/lib/api/server";

export default async function AppShellLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    // Stale cookies (or no user yet). /auth/expired clears any leftover cookies
    // and bounces to /welcome — avoids a middleware ↔ layout redirect loop.
    redirect("/auth/expired");
  }

  return (
    <AuthProvider user={user}>
      <NavProgress />
      <div className="min-h-screen bg-background flex flex-col">
        <TopBar />
        <div className="flex flex-1 w-full">
          <DesktopRail />
          <main className="flex-1 min-w-0 pb-24 lg:pb-0">{children}</main>
        </div>
        <MobileTabs />
      </div>
    </AuthProvider>
  );
}
