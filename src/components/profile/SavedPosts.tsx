"use client";

import { Bookmark, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useHydrated } from "@/hooks/useHydrated";
import { postService } from "@/services/post.service";
import { useAuthStore } from "@/store/auth";
import { usePostStore } from "@/store/post";
import type { PostWithAuthor } from "@/types";
import { GridSkeleton, PostGrid } from "@/components/post/PostGrid";

export function SavedPosts({ userId }: { userId: string }) {
  const hydrated = useHydrated();
  const authHydrated = useAuthStore((s) => s.hydrated);
  const isMe = useAuthStore((s) => s.user?.id === userId);
  const saved = usePostStore((s) => s.saved);
  const [posts, setPosts] = useState<{ key: string; items: PostWithAuthor[] } | null>(null);
  const key = saved.join(",");

  useEffect(() => {
    if (!isMe || key === "") return;
    let cancelled = false;
    postService.getByIds(key.split(","))
      .then((items) => !cancelled && setPosts({ key, items }))
      .catch(() => !cancelled && setPosts({ key, items: [] }));
    return () => {
      cancelled = true;
    };
  }, [isMe, key]);

  if (!hydrated || !authHydrated) return <GridSkeleton />;
  if (!isMe) return <EmptyState icon={Lock} title="Saved posts are private" description="Only the account owner can see what they've saved." />;
  if (saved.length === 0) {
    return <EmptyState icon={Bookmark} title="Save" description="Save photos and videos that you want to see again. Only you can see what you've saved." />;
  }
  if (!posts) return <GridSkeleton count={Math.min(saved.length, 9)} />;
  // Keep the grid in sync instantly when something is unsaved, without refetching.
  const visible = posts.items.filter((p) => saved.includes(p.id));
  return (
    <>
      <p className="text-muted px-4 py-3 text-xs md:px-0">Only you can see what you&apos;ve saved</p>
      <PostGrid posts={visible} />
    </>
  );
}
