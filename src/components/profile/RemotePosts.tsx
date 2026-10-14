"use client";

import { Camera } from "lucide-react";
import { useCallback } from "react";
import { GridSkeleton, PostGrid } from "@/components/post/PostGrid";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { queryKeys } from "@/lib/query-keys";
import type { FeedPost } from "@/services/feed.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth";
import { usePostStore } from "@/store/post";
import { useUIStore } from "@/store/ui";

const PAGE_SIZE = 12;

/** Posts grid of a backend user (GET /api/users/:username/posts). Rendered inside `RemoteProfile`. */
export function RemotePosts({ username: rawUsername }: { username: string }) {
  const username = decodeURIComponent(rawUsername).toLowerCase();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isMe = useAuthStore((s) => s.user?.username === username);
  const fetchPage = useCallback(
    async (params: { cursor: string | null; limit: number }) => {
      const page = await userService.posts(username, params);
      usePostStore.getState().syncViewerState(page.items.map((p) => ({ id: p.id, ...p.viewer })));
      return page;
    },
    [username],
  );
  // Wait for the session so isLiked/isSaved are the viewer's.
  const { items, loading, error, done, sentinelRef, loadMore } = usePaginatedQuery<FeedPost>(queryKeys.userPosts(username), fetchPage, {
    limit: PAGE_SIZE,
    enabled: hydrated,
  });
  const liked = usePostStore((s) => s.liked);
  const setCreateOpen = useUIStore((s) => s.setCreateOpen);

  // Mapped counts exclude the viewer's own like (PostActions adds it back); the grid shows the total.
  const posts = items.map((p) => (liked[p.id] ? { ...p, likes: p.likes + 1 } : p));

  if (posts.length === 0 && done) {
    return isMe ? (
      <EmptyState
        icon={Camera}
        title="Share photos"
        description="When you share photos, they'll appear on your profile."
        action={<Button onClick={() => setCreateOpen(true)}>Share your first photo</Button>}
      />
    ) : (
      <EmptyState icon={Camera} title="No posts yet" />
    );
  }

  return (
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
          <Button size="sm" variant="secondary" onClick={() => void loadMore()}>
            Try again
          </Button>
        </div>
      )}
      <div ref={sentinelRef} aria-hidden className="h-px" />
    </div>
  );
}
