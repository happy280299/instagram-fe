import { Clapperboard, Compass, Heart, Home, type LucideIcon, MessageCircle, PlusSquare, Search } from "lucide-react";
import type { Panel } from "@/store/ui";

export type NavAction =
  | { kind: "link"; href: string }
  | { kind: "panel"; panel: Exclude<Panel, null> }
  | { kind: "create" };

export interface NavEntry {
  id: string;
  label: string;
  icon: LucideIcon;
  action: NavAction;
}

export const SIDEBAR_NAV: NavEntry[] = [
  { id: "home", label: "Home", icon: Home, action: { kind: "link", href: "/" } },
  { id: "search", label: "Search", icon: Search, action: { kind: "panel", panel: "search" } },
  { id: "explore", label: "Explore", icon: Compass, action: { kind: "link", href: "/explore" } },
  { id: "reels", label: "Reels", icon: Clapperboard, action: { kind: "link", href: "/reels" } },
  { id: "direct", label: "Messages", icon: MessageCircle, action: { kind: "link", href: "/direct" } },
  { id: "notifications", label: "Notifications", icon: Heart, action: { kind: "panel", panel: "notifications" } },
  { id: "create", label: "Create", icon: PlusSquare, action: { kind: "create" } },
];

export const BOTTOM_NAV: NavEntry[] = [
  SIDEBAR_NAV[0],
  SIDEBAR_NAV[2],
  SIDEBAR_NAV[3],
  SIDEBAR_NAV[6],
  SIDEBAR_NAV[4],
];

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Label of a sidebar item: hidden while the rail is collapsed, shown when the sidebar expands
 * (hovered, or keyboard focus inside it). Relies on the `group/sidebar` class on the <nav>.
 */
export const SIDEBAR_LABEL = "sr-only whitespace-nowrap group-hover/sidebar:not-sr-only group-has-[:focus-visible]/sidebar:not-sr-only";
