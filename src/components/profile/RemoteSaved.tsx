"use client";

import { Bookmark, Lock } from "lucide-react";
import { GridSkeleton, PostGrid } from "@/components/post/PostGrid";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { queryKeys } from "@/lib/query-keys";
import type { FeedPost } from "@/services/feed.service";
import { postService } from "@/services/post.service";
import { useAuthStore } from "@/store/auth";
import { usePostStore } from "@/store/post";

const PAGE_SIZE = 12;

async function fetchSavedPage(params: { cursor: string | null; limit: number }) {
  const page = await postService.saved(params);
  usePostStore.getState().syncViewerState(page.items.map((p) => ({ id: p.id, ...p.viewer })));
  return page;
}

/** Saved tab of a backend profile (GET /api/posts/saved). Only the owner can see it. */
export function RemoteSaved({ username: rawUsername }: { username: string }) {
  const username = decodeURIComponent(rawUsername).toLowerCase();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isMe = useAuthStore((s) => s.user?.username === username);
  const { items, loading, error, done, sentinelRef, loadMore } = usePaginatedQuery<FeedPost>(queryKeys.savedPosts, fetchSavedPage, {
    limit: PAGE_SIZE,
    enabled: hydrated && isMe,
  });
  const saved = usePostStore((s) => s.saved);
  const liked = usePostStore((s) => s.liked);

  if (!hydrated) return <GridSkeleton />;
  if (!isMe) return <EmptyState icon={Lock} title="Saved posts are private" description="Only the account owner can see what they've saved." />;

  // Unsaving elsewhere (the bookmark on a post) removes it here at once, without a refetch.
  const savedNow = new Set(saved);
  const posts = items
    .filter((p) => savedNow.has(p.id))
    // Mapped counts exclude the viewer's own like (PostActions adds it back); the grid shows the total.
    .map((p) => (liked[p.id] ? { ...p, likes: p.likes + 1 } : p));

  if (posts.length === 0 && done) {
    return <EmptyState icon={Bookmark} title="Save" description="Save photos and videos that you want to see again. Only you can see what you've saved." />;
  }

  return (
    <div aria-busy={loading}>
      {posts.length > 0 && <p className="text-muted px-4 py-3 text-xs md:px-0">Only you can see what you&apos;ve saved</p>}
      <PostGrid posts={posts} />
      {loading && (
        <div className="mt-1">
          <GridSkeleton count={posts.length === 0 ? 6 : 3} />
        </div>
      )}
      {error && (
        <div role="alert" className="flex flex-col items-center gap-2 py-6">
          <p className="text-muted text-sm">Couldn&apos;t load {posts.length === 0 ? "saved posts" : "more saved posts"}.</p>
          <Button size="sm" variant="secondary" onClick={loadMore}>
            Try again
          </Button>
        </div>
      )}
      <div ref={sentinelRef} aria-hidden className="h-px" />
    </div>
  );
}
