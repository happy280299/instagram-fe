"use client";

import { Camera } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { queryKeys } from "@/lib/query-keys";
import { feedService, type FeedPost } from "@/services/feed.service";
import { useAuthStore } from "@/store/auth";
import { usePostStore } from "@/store/post";
import { useUIStore } from "@/store/ui";
import { PostCard } from "@/components/post/PostCard";
import { FeedSkeleton } from "@/components/post/PostSkeleton";

const PAGE_SIZE = 5;

export function Feed() {
  // Wait for the persisted session so the first request carries the Bearer token.
  const hydrated = useAuthStore((s) => s.hydrated);
  const fetchPage = useCallback(async (params: { cursor: string | null; limit: number }) => {
    const page = await feedService.list(params);
    usePostStore.getState().syncViewerState(page.items.map((p) => ({ id: p.id, ...p.viewer })));
    useAuthStore.getState().syncFollowing(page.items.filter((p) => p.viewer.followsAuthor).map((p) => p.authorId));
    return page;
  }, []);
  const { items: posts, loading, error, done, sentinelRef, loadMore } = usePaginatedQuery<FeedPost>(queryKeys.feed, fetchPage, {
    limit: PAGE_SIZE,
    enabled: hydrated,
  });
  const setCreateOpen = useUIStore((s) => s.setCreateOpen);

  if (posts.length === 0 && done) {
    return (
      <EmptyState
        icon={Camera}
        title="No posts yet"
        description="When people you follow share photos, they'll appear here."
        action={<Button onClick={() => setCreateOpen(true)}>Share your first photo</Button>}
      />
    );
  }

  return (
    <section aria-label="Feed" aria-busy={loading}>
      {posts.map((post, i) => (
        <PostCard key={post.id} post={post} priority={i === 0} />
      ))}
      {loading && <FeedSkeleton count={posts.length === 0 ? 2 : 1} />}
      {error && (
        <div className="flex flex-col items-center gap-2 py-6">
          <p className="text-muted text-sm">Couldn&apos;t load {posts.length === 0 ? "your feed" : "more posts"}.</p>
          <Button size="sm" variant="secondary" onClick={() => void loadMore()}>
            Try again
          </Button>
        </div>
      )}
      {done && posts.length > 0 && <p className="text-muted py-8 text-center text-sm">You&apos;re all caught up ✨</p>}
      <div ref={sentinelRef} aria-hidden className="h-px" />
    </section>
  );
}
