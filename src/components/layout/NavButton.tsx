"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/store/ui";
import { isActivePath, type NavEntry, SIDEBAR_LABEL } from "./nav";

interface NavButtonProps {
  entry: NavEntry;
  /** Show the text label when the sidebar expands (see SIDEBAR_LABEL). */
  showLabel: boolean;
  compact?: boolean;
}

export function NavButton({ entry, showLabel, compact }: NavButtonProps) {
  const pathname = usePathname();
  const panel = useUIStore((s) => s.panel);
  const togglePanel = useUIStore((s) => s.togglePanel);
  const setCreateOpen = useUIStore((s) => s.setCreateOpen);
  const { action, icon: Icon, label } = entry;

  const active =
    action.kind === "link" ? panel === null && isActivePath(pathname, action.href) : action.kind === "panel" && panel === action.panel;

  const content = (
    <>
      <Icon aria-hidden className={cn("size-6 shrink-0 transition-transform group-hover:scale-105")} strokeWidth={active ? 2.75 : 2} />
      <span className={cn("truncate", active && "font-bold", showLabel ? SIDEBAR_LABEL : "sr-only")}>{label}</span>
    </>
  );
  const className = cn(
    "group flex items-center gap-4 rounded-lg transition-colors hover:bg-hover",
    compact ? "justify-center p-3" : "my-0.5 p-3",
    action.kind === "panel" && panel === action.panel && "outline-separator outline",
  );

  if (action.kind === "link") {
    return (
      <Link href={action.href} className={className} aria-current={active ? "page" : undefined} title={label}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={cn(className, "w-full text-left")}
      title={label}
      aria-expanded={action.kind === "panel" ? active : undefined}
      onClick={() => (action.kind === "panel" ? togglePanel(action.panel) : setCreateOpen(true))}
    >
      {content}
    </button>
  );
}
