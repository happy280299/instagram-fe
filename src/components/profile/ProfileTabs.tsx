"use client";

import { Bookmark, Clapperboard, Grid3x3, type LucideIcon, SquareUser } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/auth";
import type { ProfileTab } from "@/types";

const TABS: { id: ProfileTab; label: string; icon: LucideIcon; suffix: string }[] = [
  { id: "posts", label: "Posts", icon: Grid3x3, suffix: "" },
  { id: "reels", label: "Reels", icon: Clapperboard, suffix: "/reels" },
  { id: "saved", label: "Saved", icon: Bookmark, suffix: "/saved" },
  { id: "tagged", label: "Tagged", icon: SquareUser, suffix: "/tagged" },
];

interface ProfileTabsProps {
  username: string;
  userId: string;
  /** Limits the tabs shown; all by default. */
  tabs?: ProfileTab[];
}

export function ProfileTabs({ username, userId, tabs }: ProfileTabsProps) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const isMe = useAuthStore((s) => s.user?.id === userId);
  const base = `/${username}`;
  const visible = TABS.filter((t) => (!tabs || tabs.includes(t.id)) && (t.id !== "saved" || (hydrated && isMe)));

  return (
    <nav aria-label="Profile sections" className="border-separator border-t">
      <ul className="flex justify-around md:justify-center md:gap-14">
        {visible.map(({ id, label, icon: Icon, suffix }) => {
          const href = `${base}${suffix}`;
          const active = decodeURIComponent(pathname) === href;
          return (
            <li key={id}>
              <Link
                href={href}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mt-px flex h-11 items-center gap-1.5 border-t text-xs font-semibold tracking-wider uppercase md:h-[52px]",
                  active ? "border-foreground text-foreground" : "text-muted border-transparent",
                )}
              >
                <Icon aria-hidden className="size-6 md:size-3" />
                <span className="sr-only md:not-sr-only">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
