"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth";
import type { UserSummary } from "@/types";
import { SuggestionItem } from "./SuggestionItem";

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2" aria-hidden>
      <Skeleton rounded="full" className="size-avatar-md" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  );
}

export function RightColumn() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<UserSummary[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    userService.suggested(5)
      .then((list) => !cancelled && setSuggestions(list))
      .catch(() => !cancelled && setSuggestions([]));
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="sticky top-0 pt-9 pl-16">
      {user ? (
        <div className="flex items-center gap-3 py-2">
          <Link href={`/${user.username}`} aria-hidden tabIndex={-1}>
            <Avatar src={user.avatar} username={user.username} size="md" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/${user.username}`} className="block truncate text-sm font-semibold">
              {user.username}
            </Link>
            <p className="text-muted truncate text-sm">{user.fullName}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="text-primary hover:text-foreground text-xs font-semibold"
          >
            Switch
          </button>
        </div>
      ) : (
        <RowSkeleton />
      )}
      <div className="mt-4 mb-2 flex items-center justify-between">
        <h2 className="text-muted text-sm font-semibold">Suggested for you</h2>
        <Link href="/explore" className="text-xs font-semibold hover:opacity-60">
          See all
        </Link>
      </div>
      {suggestions === null ? (
        <div role="status" aria-label="Loading suggestions">
          {Array.from({ length: 5 }, (_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-muted py-2 text-sm">No suggestions right now.</p>
      ) : (
        <ul>
          {suggestions.map((s) => (
            <SuggestionItem key={s.id} user={s} />
          ))}
        </ul>
      )}
      <p className="text-muted mt-8 text-xs leading-5">
        About · Help · Privacy · Terms · Language
        <br />© {new Date().getFullYear()} INSTACLONE — a UI demo
      </p>
    </div>
  );
}
