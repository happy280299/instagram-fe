"use client";

import { useQuery } from "@tanstack/react-query";
import { Hash } from "lucide-react";
import { useCallback } from "react";
import { GridSkeleton, PostGrid } from "@/components/post/PostGrid";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { HttpError } from "@/lib/api";
import { compactNumber } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import type { FeedPost } from "@/services/feed.service";
import { hashtagService } from "@/services/hashtag.service";
import { useAuthStore } from "@/store/auth";
import { usePostStore } from "@/store/post";

const PAGE_SIZE = 12;

/** /explore/tags/<tag>: the tag, how many posts use it, and those posts newest first. */
export function HashtagPage({ tag: rawTag }: { tag: string }) {
  const tag = rawTag.trim().replace(/^#+/, "").toLowerCase().normalize("NFC");
  const hydrated = useAuthStore((s) => s.hydrated);
  const info = useQuery({ queryKey: queryKeys.hashtag(tag), queryFn: () => hashtagService.get(tag), enabled: tag !== "" });
  const missing = tag === "" || (info.error instanceof HttpError && info.error.status === 404);
  const fetchPage = useCallback(
    async (params: { cursor: string | null; limit: number }) => {
      const page = await hashtagService.posts(tag, params);
      usePostStore.getState().syncViewerState(page.items.map((p) => ({ id: p.id, ...p.viewer })));
      return page;
    },
    [tag],
  );
  const { items, loading, error, done, sentinelRef, loadMore } = usePaginatedQuery<FeedPost>(queryKeys.hashtagPosts(tag), fetchPage, {
    limit: PAGE_SIZE,
    enabled: hydrated && !missing,
  });
  const liked = usePostStore((s) => s.liked);
  // Mapped counts exclude the viewer's own like (PostActions adds it back); the grid shows the total.
  const posts = items.map((p) => (liked[p.id] ? { ...p, likes: p.likes + 1 } : p));

  return (
    <div className="max-w-content mx-auto w-full pt-6 pb-8 md:px-5 md:pt-10">
      <header className="flex items-center gap-4 px-4 pb-8 md:gap-8 md:px-0">
        <span className="border-separator flex size-20 shrink-0 items-center justify-center rounded-full border md:size-36">
          <Hash aria-hidden className="size-8 md:size-14" strokeWidth={1.25} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">#{tag}</h1>
          {info.data ? (
            <p className="text-muted">
              <span className="text-foreground font-semibold">{compactNumber(info.data.postCount)}</span> {info.data.postCount === 1 ? "post" : "posts"}
            </p>
          ) : (
            !missing && !info.isError && <Skeleton className="mt-2 h-4 w-20" />
          )}
        </div>
      </header>
      {missing || (posts.length === 0 && done) ? (
        <EmptyState icon={Hash} title="No posts yet" description={`Posts with #${tag || "this tag"} will appear here.`} />
      ) : (
        <div aria-busy={loading}>
          <PostGrid posts={posts} />
          {loading && (
            <div className="mt-1">
              <GridSkeleton count={posts.length === 0 ? 6 : 3} />
            </div>
          )}
          {error && (
            <div role="alert" className="flex flex-col items-center gap-2 py-6">
              <p className="text-muted text-sm">Couldn&apos;t load {posts.length === 0 ? "posts" : "more posts"}.</p>
              <Button size="sm" variant="secondary" onClick={loadMore}>
                Try again
              </Button>
            </div>
          )}
          <div ref={sentinelRef} aria-hidden className="h-px" />
        </div>
      )}
    </div>
  );
}
