"use client";

import { Bookmark, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/cn";
import { SIDEBAR_LABEL } from "./nav";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import { ActivityStatusToggle } from "./ActivityStatusToggle";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function MoreMenu({ showLabel }: { showLabel: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useFocusTrap<HTMLDivElement>(open, close);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const itemClass = "hover:bg-hover flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left";

  return (
    <div className="relative">
      {open && <div aria-hidden className="fixed inset-0 z-40" onClick={close} />}
      {open && (
        <div
          ref={ref}
          role="menu"
          aria-label="More options"
          className="bg-elevated animate-fade-in absolute bottom-full left-0 z-50 mb-2 w-56 rounded-2xl p-2 shadow-[0_4px_24px_rgb(0_0_0/0.15)]"
        >
          {user && (
            <Link role="menuitem" href={`/${user.username}/saved`} onClick={close} className={itemClass}>
              <Bookmark aria-hidden className="size-5" /> Saved
            </Link>
          )}
          <ThemeSwitcher />
          <ActivityStatusToggle />
          <div className="bg-separator my-1 h-px" />
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              close();
              logout();
              toast("You've been logged out");
              router.replace("/login");
            }}
          >
            <LogOut aria-hidden className="size-5" /> Log out
          </button>
        </div>
      )}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title="More"
        onClick={() => setOpen((v) => !v)}
        className={cn("hover:bg-hover flex w-full items-center gap-4 rounded-lg p-3", !showLabel && "justify-center")}
      >
        <Menu aria-hidden className="size-6" strokeWidth={open ? 2.75 : 2} />
        <span className={cn(open && "font-bold", showLabel ? SIDEBAR_LABEL : "sr-only")}>More</span>
      </button>
    </div>
  );
}
