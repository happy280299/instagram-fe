"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { FollowListKind } from "@/components/user/FollowListModal";
import { useHydrated } from "@/hooks/useHydrated";
import { compactNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/auth";
import type { User } from "@/types";

const FollowListModal = dynamic(() => import("@/components/user/FollowListModal").then((m) => m.FollowListModal), { ssr: false });

interface ProfileStatsProps {
  user: User;
  className?: string;
  /** Followers/following open their lists (backend profiles only). */
  canOpenLists?: boolean;
}

/** Posts / followers / following. Follower count reflects the viewer's optimistic follow. */
export function ProfileStats({ user, className, canOpenLists = false }: ProfileStatsProps) {
  const hydrated = useHydrated();
  const delta = useAuthStore((s) => s.followerDelta(user.id));
  const [openList, setOpenList] = useState<FollowListKind | null>(null);
  const followers = user.followers + (hydrated ? delta : 0);
  const stats: { label: string; value: number; list?: FollowListKind }[] = [
    { label: "posts", value: user.postsCount },
    { label: "followers", value: followers, list: "followers" },
    { label: "following", value: user.following, list: "following" },
  ];
  return (
    <>
      <ul className={cn("flex", className)}>
        {stats.map((s) => {
          const content = (
            <>
              <span className="font-semibold">{compactNumber(s.value)}</span> <span className="text-muted md:text-foreground">{s.label}</span>
            </>
          );
          return (
            <li key={s.label} className="flex-1 md:flex-none">
              {canOpenLists && s.list ? (
                <button type="button" onClick={() => setOpenList(s.list ?? null)} className="hover:opacity-60">
                  {content}
                </button>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
      {openList && <FollowListModal username={user.username} kind={openList} onClose={() => setOpenList(null)} />}
    </>
  );
}
