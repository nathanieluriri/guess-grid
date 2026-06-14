"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * A thin top progress bar that appears the moment an internal link is clicked
 * and disappears once the new route renders. App Router has no router events, so
 * we detect navigation starts by intercepting same-origin anchor clicks and end
 * them when the pathname changes. Gives instant "the page is loading" feedback.
 */
export function NavProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const safety = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Route changed → navigation finished.
  useEffect(() => {
    setActive(false);
    if (safety.current) clearTimeout(safety.current);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");
      if (!href || href.startsWith("#") || (targetAttr && targetAttr !== "_self")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setActive(true);
      if (safety.current) clearTimeout(safety.current);
      safety.current = setTimeout(() => setActive(false), 10000);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 bg-transparent" aria-hidden="true">
      <div className="nav-progress-bar h-full bg-[hsl(var(--accent))] shadow-[0_0_8px_hsl(var(--accent)/0.6)]" />
    </div>
  );
}
