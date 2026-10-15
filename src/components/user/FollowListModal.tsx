"use client";

import { Users } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { queryKeys } from "@/lib/query-keys";
import { type FollowListUser, userService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth";
import { UserListItem } from "./UserListItem";

export type FollowListKind = "followers" | "following";

const PAGE_SIZE = 20;

const COPY: Record<FollowListKind, { title: string; empty: string }> = {
  followers: { title: "Followers", empty: "When people follow this account, you'll see them here." },
  following: { title: "Following", empty: "When this account follows people, you'll see them here." },
};

/** Followers or following of a backend user (GET /api/users/:username/followers | /following). */
export function FollowListModal({ username, kind, onClose }: { username: string; kind: FollowListKind; onClose: () => void }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const fetchPage = useCallback(
    async (params: { cursor: string | null; limit: number }) => {
      const page = await userService[kind](username, params);
      useAuthStore.getState().syncFollowing(page.items.filter((u) => u.isFollowing).map((u) => u.id));
      return page;
    },
    [username, kind],
  );
  const queryKey = kind === "followers" ? queryKeys.followers(username) : queryKeys.following(username);
  // Wait for the session so isFollowing is the viewer's.
  const { items, loading, error, done, sentinelRef, loadMore } = usePaginatedQuery<FollowListUser>(queryKey, fetchPage, {
    limit: PAGE_SIZE,
    enabled: hydrated,
  });

  return (
    <Modal open onClose={onClose} title={COPY[kind].title} className="h-[min(70dvh,560px)] md:max-w-md!">
      <div className="flex-1 overflow-y-auto px-4" aria-busy={loading}>
        {items.length === 0 && done ? (
          <EmptyState icon={Users} title={`No ${kind} yet`} description={COPY[kind].empty} />
        ) : (
          <ul aria-label={COPY[kind].title}>
            {items.map((user) => (
              <UserListItem key={user.id} user={user} />
            ))}
          </ul>
        )}
        {loading && <RowsSkeleton count={items.length === 0 ? 6 : 2} />}
        {error && (
          <div role="alert" className="flex flex-col items-center gap-2 py-6 text-center">
            <p className="text-muted text-sm">Couldn&apos;t load {items.length === 0 ? kind : `more ${kind}`}.</p>
            <Button size="sm" variant="secondary" onClick={loadMore}>
              Try again
            </Button>
          </div>
        )}
        <div ref={sentinelRef} aria-hidden className="h-px" />
      </div>
    </Modal>
  );
}

function RowsSkeleton({ count }: { count: number }) {
  return (
    <div role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-2" aria-hidden>
          <Skeleton rounded="full" className="size-avatar-md" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
