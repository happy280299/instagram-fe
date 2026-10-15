"use client";

import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/store/ui";
import { MoreMenu } from "./MoreMenu";
import { NavButton } from "./NavButton";
import { SIDEBAR_NAV } from "./nav";
import { ProfileNavLink } from "./ProfileNavLink";

/**
 * ≥768px: an icon-only rail that expands over the page (icons + labels) on hover or keyboard focus,
 * except while a panel is open. <768px: hidden (TopBar + BottomNav instead).
 */
export function Sidebar() {
  // An open panel docks beside the rail; expanding would cover it.
  const expandable = useUIStore((s) => s.panel === null);

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "group/sidebar bg-background border-separator fixed inset-y-0 left-0 z-40 hidden flex-col overflow-x-hidden border-r px-3 pt-2 pb-5 transition-[width,box-shadow] duration-200 md:flex",
        "w-(--container-sidebar-collapsed)",
        // Overlays the page instead of pushing it, so hovering doesn't reflow the content.
        expandable && "hover:w-(--container-sidebar) hover:shadow-xl has-[:focus-visible]:w-(--container-sidebar) has-[:focus-visible]:shadow-xl",
      )}
    >
      <Link href="/" aria-label="Instaclone home" className="mb-5 flex h-[73px] items-center px-3 pt-6 pb-4">
        <LogoMark className={cn("size-6 shrink-0", expandable && "group-hover/sidebar:hidden group-has-[:focus-visible]/sidebar:hidden")} />
        <Wordmark className={cn("hidden", expandable && "group-hover/sidebar:block group-has-[:focus-visible]/sidebar:block")} />
      </Link>
      <ul className="flex flex-1 flex-col">
        {SIDEBAR_NAV.map((entry) => (
          <li key={entry.id}>
            <NavButton entry={entry} showLabel={expandable} />
          </li>
        ))}
        <li>
          <ProfileNavLink showLabel={expandable} />
        </li>
      </ul>
      <MoreMenu showLabel={expandable} />
    </nav>
  );
}
