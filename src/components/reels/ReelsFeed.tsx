"use client";

import { Clapperboard } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { queryKeys } from "@/lib/query-keys";
import type { FeedPost } from "@/services/feed.service";
import { postService } from "@/services/post.service";
import { reelService } from "@/services/reel.service";
import { useAuthStore } from "@/store/auth";
import { usePostStore } from "@/store/post";
import type { Paginated } from "@/types";
import { ReelItem } from "./ReelItem";

const PAGE_SIZE = 10;
const HEIGHT = "h-[calc(100dvh-var(--spacing-topbar)-var(--spacing-bottomnav))] md:h-dvh";

/** First batch when opened on one reel (?r=, from a profile grid or a shared link): that reel, then recommendations. */
async function firstPageFrom(startId: string, limit: number): Promise<Paginated<FeedPost>> {
  const [start, rest] = await Promise.all([
    postService.getById(startId).catch(() => null),
    // Exclude it from the recommendations so it isn't shown twice.
    reelService.list({ cursor: startId, limit }),
  ]);
  return start?.isReel ? { ...rest, items: [start, ...rest.items] } : rest;
}

async function fetchReels(startId: string | null, { cursor, limit }: { cursor: string | null; limit: number }) {
  const page = cursor === null && startId ? await firstPageFrom(startId, limit) : await reelService.list({ cursor, limit });
  usePostStore.getState().syncViewerState(page.items.map((p) => ({ id: p.id, ...p.viewer })));
  useAuthStore.getState().syncFollowing(page.items.filter((p) => p.viewer.followsAuthor).map((p) => p.authorId));
  return page;
}

/** Vertical, scroll-snapping Reels tab (GET /api/reels). Loads more near the end; preloads only the next reel. */
export function ReelsFeed({ startId }: { startId: string | null }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const start = startId && /^\d+$/.test(startId) ? startId : null;
  const fetchPage = useCallback((params: { cursor: string | null; limit: number }) => fetchReels(start, params), [start]);
  // Recommendations depend on who's watching (follows, already seen), so wait for the session.
  const { items, loading, error, done, sentinelRef, loadMore } = usePaginatedQuery<FeedPost>(queryKeys.reels(start), fetchPage, {
    limit: PAGE_SIZE,
    enabled: hydrated,
  });
  const [active, setActive] = useState(0);

  if (items.length === 0 && loading) {
    return (
      <div role="status" aria-label="Loading reels" className={`flex items-center justify-center md:py-4 ${HEIGHT}`}>
        <Skeleton rounded="none" className="h-full w-full md:aspect-9/16 md:w-auto md:rounded-lg" />
      </div>
    );
  }
  if (items.length === 0 && error) {
    return (
      <div role="alert" className={`flex flex-col items-center justify-center gap-3 ${HEIGHT}`}>
        <p className="text-muted text-sm">Couldn&apos;t load reels.</p>
        <Button size="sm" variant="secondary" onClick={loadMore}>
          Try again
        </Button>
      </div>
    );
  }
  if (items.length === 0 && done) {
    return <EmptyState icon={Clapperboard} title="No reels yet" description="Post a single video and it shows up here as a reel." />;
  }

  return (
    <ul aria-label="Reels" className={`scrollbar-none snap-y snap-mandatory overflow-y-scroll ${HEIGHT}`}>
      {items.map((reel, i) => (
        <li key={reel.id} className="relative h-full snap-start snap-always">
          {i === Math.max(items.length - 2, 0) && <div ref={sentinelRef} aria-hidden className="absolute top-0 h-px w-px" />}
          <ReelItem reel={reel} preload={i === active || i === active + 1} onVisible={() => setActive(i)} />
        </li>
      ))}
      {(loading || error) && (
        <li className="flex h-24 items-center justify-center">
          {error ? (
            <Button size="sm" variant="secondary" onClick={loadMore}>
              Couldn&apos;t load more. Try again
            </Button>
          ) : (
            <Skeleton rounded="full" className="size-8" />
          )}
        </li>
      )}
      {done && <li className="text-muted flex h-24 items-center justify-center text-sm">You&apos;re all caught up</li>}
    </ul>
  );
}
