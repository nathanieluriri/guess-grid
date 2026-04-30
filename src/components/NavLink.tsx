"use client";

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavLinkClassName =
  | string
  | ((state: { isActive: boolean; isPending: boolean }) => string | undefined);

type NavLinkChildren =
  | ReactNode
  | ((state: { isActive: boolean; isPending: boolean }) => ReactNode);

interface NavLinkCompatProps
  extends Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children"> {
  to: string;
  className?: NavLinkClassName;
  activeClassName?: string;
  pendingClassName?: string;
  children: NavLinkChildren;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName: _pendingClassName, to, children, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === to || (to !== "/" && pathname.startsWith(`${to}/`));
    const state = { isActive, isPending: false };
    const resolvedClassName =
      typeof className === "function" ? className(state) : className;

    return (
      <Link
        ref={ref}
        href={to}
        className={cn(resolvedClassName, isActive && activeClassName)}
        {...props}
      >
        {typeof children === "function" ? children(state) : children}
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
