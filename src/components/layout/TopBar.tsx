"use client";

import { Heart, Search } from "lucide-react";
import Link from "next/link";
import { IconButton } from "@/components/ui/IconButton";
import { Wordmark } from "@/components/ui/Logo";
import { useUIStore } from "@/store/ui";

/** Mobile (<768px) header. */
export function TopBar() {
  const panel = useUIStore((s) => s.panel);
  const togglePanel = useUIStore((s) => s.togglePanel);

  return (
    <header className="bg-background border-separator h-topbar fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b px-4 md:hidden">
      <Link href="/" aria-label="Instaclone home">
        <Wordmark className="text-xl" />
      </Link>
      <div className="flex items-center gap-1">
        <IconButton label="Search" aria-expanded={panel === "search"} onClick={() => togglePanel("search")}>
          <Search aria-hidden className="size-6" strokeWidth={panel === "search" ? 2.75 : 2} />
        </IconButton>
        <IconButton label="Notifications" aria-expanded={panel === "notifications"} onClick={() => togglePanel("notifications")}>
          <Heart aria-hidden className="size-6" strokeWidth={panel === "notifications" ? 2.75 : 2} />
        </IconButton>
      </div>
    </header>
  );
}
