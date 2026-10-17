"use client";

import { Compass } from "lucide-react";
import { GridItem } from "@/components/post/GridItem";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { cn } from "@/lib/cn";
import { queryKeys } from "@/lib/query-keys";
import type { FeedPost } from "@/services/feed.service";
import { postService } from "@/services/post.service";
import { useAuthStore } from "@/store/auth";
import { usePostStore } from "@/store/post";

const GROUP = 5;
const PAGE_SIZE = 24;

async function fetchExplore(params: { cursor: string | null; limit: number }) {
  const page = await postService.explore(params);
  usePostStore.getState().syncViewerState(page.items.map((p) => ({ id: p.id, ...p.viewer })));
  return page;
}

/** GET /api/explore in Instagram's pattern: every 5 tiles = 1 tall tile + 4 squares, tall side alternating. */
export function ExploreGrid() {
  // Ranking depends on who's watching (follows, likes), so wait for the session.
  const hydrated = useAuthStore((s) => s.hydrated);
  const { items, loading, error, done, sentinelRef, loadMore } = usePaginatedQuery<FeedPost>(queryKeys.explore, fetchExplore, {
    limit: PAGE_SIZE,
    enabled: hydrated,
  });
  const liked = usePostStore((s) => s.liked);

  if (items.length === 0 && done) {
    return <EmptyState icon={Compass} title="Nothing to explore" description="Posts from people you don't follow yet will show up here." />;
  }

  const groups: FeedPost[][] = [];
  for (let i = 0; i < items.length; i += GROUP) groups.push(items.slice(i, i + GROUP));

  return (
    <div className="flex flex-col gap-0.5 md:gap-1" aria-busy={loading}>
      {groups.map((group, g) => (
        <ul key={group[0].id} className="grid grid-cols-3 grid-rows-2 gap-0.5 md:gap-1">
          {group.map((post, i) => {
            const tall = i === 0 && group.length === GROUP;
            const media = post.media[0];
            const isVideo = media?.type === "video";
            return (
              <li key={post.id} className={cn(tall && "row-span-2", tall && g % 2 === 1 && "col-start-3 row-start-1")}>
                <GridItem
                  href={post.isReel ? `/reels?r=${post.id}` : `/p/${post.id}`}
                  image={isVideo ? (media.poster ?? "") : (media?.url ?? "")}
                  alt={media?.alt ?? `Post by ${post.author.username}`}
                  // Mapped counts exclude the viewer's own like; the grid shows the total.
                  likes={post.likes + (liked[post.id] ? 1 : 0)}
                  comments={post.commentsCount}
                  multiple={post.media.length > 1}
                  video={isVideo}
                  views={post.isReel ? post.viewCount : undefined}
                  shape={tall ? "fill" : "square"}
                  sizes={tall ? "(max-width: 767px) 66vw, 620px" : "(max-width: 767px) 33vw, 310px"}
                  priority={g === 0}
                />
              </li>
            );
          })}
        </ul>
      ))}
      {loading && <ExploreSkeleton />}
      {error && (
        <div role="alert" className="flex flex-col items-center gap-2 py-6">
          <p className="text-muted text-sm">Couldn&apos;t load {items.length === 0 ? "Explore" : "more posts"}.</p>
          <Button size="sm" variant="secondary" onClick={loadMore}>
            Try again
          </Button>
        </div>
      )}
      <div ref={sentinelRef} aria-hidden className="h-px" />
    </div>
  );
}

export function ExploreSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-3 grid-rows-2 gap-0.5 md:gap-1">
      <Skeleton rounded="none" className="row-span-2 h-full w-full" />
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} rounded="none" className="aspect-square w-full" />
      ))}
    </div>
  );
}
