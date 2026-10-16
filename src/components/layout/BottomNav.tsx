"use client";

import { NavButton } from "./NavButton";
import { navBadge } from "./navBadge";
import { BOTTOM_NAV } from "./nav";
import { ProfileNavLink } from "./ProfileNavLink";

/** Mobile (<768px) tab bar. */
export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="bg-background border-separator h-bottomnav fixed inset-x-0 bottom-0 z-40 border-t md:hidden"
    >
      <ul className="flex h-full items-center justify-around">
        {BOTTOM_NAV.map((entry) => (
          <li key={entry.id}>
            <NavButton entry={entry} showLabel={false} compact badge={navBadge(entry.id)} />
          </li>
        ))}
        <li>
          <ProfileNavLink showLabel={false} compact />
        </li>
      </ul>
    </nav>
  );
}
