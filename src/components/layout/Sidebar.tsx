"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/store/ui";
import { MoreMenu } from "./MoreMenu";
import { NavButton } from "./NavButton";
import { isCompactRoute, SIDEBAR_NAV } from "./nav";
import { ProfileNavLink } from "./ProfileNavLink";

/**
 * ≥1264px: full sidebar with labels (collapses while a panel is open).
 * 768–1263px: icon-only rail. <768px: hidden (TopBar + BottomNav instead).
 */
export function Sidebar() {
  const panelOpen = useUIStore((s) => s.panel !== null);
  const pathname = usePathname();
  // Like Instagram, the inbox always uses the compact rail.
  const expanded = !panelOpen && !isCompactRoute(pathname);

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "bg-background border-separator fixed inset-y-0 left-0 z-40 hidden flex-col border-r px-3 pt-2 pb-5 transition-[width] duration-200 md:flex",
        "w-(--container-sidebar-collapsed)",
        expanded && "xl:w-(--container-sidebar)",
      )}
    >
      <Link href="/" aria-label="Instaclone home" className="mb-5 flex h-[73px] items-center px-3 pt-6 pb-4">
        <LogoMark className={cn("size-6", expanded && "xl:hidden")} />
        <Wordmark className={cn("hidden", expanded && "xl:block")} />
      </Link>
      <ul className="flex flex-1 flex-col">
        {SIDEBAR_NAV.map((entry) => (
          <li key={entry.id}>
            <NavButton entry={entry} showLabel={expanded} />
          </li>
        ))}
        <li>
          <ProfileNavLink showLabel={expanded} />
        </li>
      </ul>
      <MoreMenu showLabel={expanded} />
    </nav>
  );
}
