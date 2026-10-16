"use client";

import { Clapperboard } from "lucide-react";
import { useCallback } from "react";
import { GridItem } from "@/components/post/GridItem";
import { GridSkeleton } from "@/components/post/PostGrid";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { queryKeys } from "@/lib/query-keys";
import type { FeedPost } from "@/services/feed.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth";
import { usePostStore } from "@/store/post";

const PAGE_SIZE = 12;

/** Reels tab of a backend profile (GET /api/users/:username/reels), including reels not shared to the feed. */
export function RemoteReels({ username: rawUsername }: { username: string }) {
  const username = decodeURIComponent(rawUsername).toLowerCase();
  const hydrated = useAuthStore((s) => s.hydrated);
  const fetchPage = useCallback(
    async (params: { cursor: string | null; limit: number }) => {
      const page = await userService.reels(username, params);
      usePostStore.getState().syncViewerState(page.items.map((p) => ({ id: p.id, ...p.viewer })));
      return page;
    },
    [username],
  );
  const { items, loading, error, done, sentinelRef, loadMore } = usePaginatedQuery<FeedPost>(queryKeys.userReels(username), fetchPage, {
    limit: PAGE_SIZE,
    enabled: hydrated,
  });
  const liked = usePostStore((s) => s.liked);

  if (items.length === 0 && done) {
    return <EmptyState icon={Clapperboard} title="No reels yet" description="Reels shared by this account will appear here." />;
  }

  return (
    <div aria-busy={loading}>
      <ul className="grid grid-cols-3 gap-0.5 md:gap-1">
        {items.map((reel) => (
          <li key={reel.id}>
            <GridItem
              href={`/reels?r=${reel.id}`}
              image={reel.media[0]?.poster ?? ""}
              alt={`Reel by ${reel.author.username}`}
              // Mapped counts exclude the viewer's own like; the grid shows the total.
              likes={reel.likes + (liked[reel.id] ? 1 : 0)}
              comments={reel.commentsCount}
              views={reel.viewCount ?? 0}
              shape="reel"
            />
          </li>
        ))}
      </ul>
      {loading && (
        <div className="mt-1">
          <GridSkeleton count={items.length === 0 ? 6 : 3} />
        </div>
      )}
      {error && (
        <div role="alert" className="flex flex-col items-center gap-2 py-6">
          <p className="text-muted text-sm">Couldn&apos;t load {items.length === 0 ? "reels" : "more reels"}.</p>
          <Button size="sm" variant="secondary" onClick={loadMore}>
            Try again
          </Button>
        </div>
      )}
      <div ref={sentinelRef} aria-hidden className="h-px" />
    </div>
  );
}
