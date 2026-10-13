"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/auth";

export function ProfileNavLink({ showLabel, compact }: { showLabel: boolean; compact?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  if (!user) return <Skeleton rounded="full" className={cn("size-avatar-xs", "m-3")} />;

  const href = `/${user.username}`;
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title="Profile"
      className={cn("hover:bg-hover flex items-center gap-4 rounded-lg p-3", compact && "justify-center")}
    >
      <Avatar
        src={user.avatar}
        username={user.username}
        size="xs"
        className={cn("rounded-full", active && "outline-foreground outline-2 outline-offset-1")}
      />
      <span className={cn(active && "font-bold", showLabel ? "sr-only xl:not-sr-only" : "sr-only")}>Profile</span>
    </Link>
  );
}
