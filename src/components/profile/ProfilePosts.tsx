"use client";

import { Camera, SquareUser } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import type { Paginated, PostWithAuthor } from "@/types";
import { GridSkeleton, PostGrid } from "@/components/post/PostGrid";

interface ProfilePostsProps {
  username: string;
  tab: "posts" | "tagged";
  initial: Paginated<PostWithAuthor>;
}

const EMPTY = {
  posts: { icon: Camera, title: "No posts yet", description: "When photos are shared, they'll appear here." },
  tagged: { icon: SquareUser, title: "No photos", description: "When people tag this account in photos, they'll appear here." },
};

export function ProfilePosts({ username, tab, initial }: ProfilePostsProps) {
  const { items, loading, sentinelRef } = useInfiniteList<PostWithAuthor>(`/api/users/${username}/posts`, { initial, params: { tab } });
  const posts = items;

  if (posts.length === 0 && !loading) {
    const empty = EMPTY[tab];
    return <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />;
  }
  return (
    <div aria-busy={loading}>
      <PostGrid posts={posts} />
      {loading && <div className="mt-1"><GridSkeleton count={3} /></div>}
      <div ref={sentinelRef} aria-hidden className="h-px" />
    </div>
  );
}
