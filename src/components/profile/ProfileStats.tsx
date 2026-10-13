"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { compactNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/auth";
import type { User } from "@/types";

/** Posts / followers / following. Follower count reflects the viewer's optimistic follow. */
export function ProfileStats({ user, className }: { user: User; className?: string }) {
  const hydrated = useHydrated();
  const delta = useAuthStore((s) => s.followerDelta(user.id));
  const followers = user.followers + (hydrated ? delta : 0);
  const stats = [
    { label: "posts", value: user.postsCount },
    { label: "followers", value: followers },
    { label: "following", value: user.following },
  ];
  return (
    <ul className={cn("flex", className)}>
      {stats.map((s) => (
        <li key={s.label} className="flex-1 md:flex-none">
          <span className="font-semibold">{compactNumber(s.value)}</span> <span className="text-muted md:text-foreground">{s.label}</span>
        </li>
      ))}
    </ul>
  );
}
