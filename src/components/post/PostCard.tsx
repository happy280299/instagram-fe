"use client";

import Link from "next/link";
import { useState } from "react";
import { usePostStore } from "@/store/post";
import { useUIStore } from "@/store/ui";
import type { CommentWithAuthor, PostWithAuthor } from "@/types";
import { AddComment } from "@/components/comment/AddComment";
import { PostActions } from "./PostActions";
import { PostCaption } from "./PostCaption";
import { PostHeader } from "./PostHeader";
import { PostMedia } from "./PostMedia";

export function PostCard({ post, priority }: { post: PostWithAuthor; priority?: boolean }) {
  const setLike = usePostStore((s) => s.setLike);
  const openComments = useUIStore((s) => s.openComments);
  const [mine, setMine] = useState<CommentWithAuthor[]>([]);
  const total = post.commentsCount + mine.length;

  return (
    <article className="border-separator mb-4 border-b pb-4" aria-label={`Post by ${post.author.username}`}>
      <PostHeader post={post} />
      <PostMedia media={post.media} priority={priority} onDoubleTap={() => void setLike(post.id, true)} className="md:rounded-sm" />
      <div className="px-3 pt-1 md:px-0">
        <PostActions post={post} />
        <PostCaption author={post.author} caption={post.caption} />
        {total > 0 && (
          <button type="button" onClick={() => openComments(post.id)} className="text-muted mt-1 block text-sm">
            View all {total} comments
          </button>
        )}
        {post.previewComments?.map((c) => (
          <p key={c.id} className="mt-0.5 text-sm">
            <Link href={`/${c.author.username}`} className="mr-1 font-semibold">
              {c.author.username}
            </Link>
            {c.text}
          </p>
        ))}
        {mine.map((c) => (
          <p key={c.id} className="mt-0.5 text-sm">
            <Link href={`/${c.author.username}`} className="mr-1 font-semibold">
              {c.author.username}
            </Link>
            {c.text}
          </p>
        ))}
        <AddComment postId={post.id} onAdded={(c) => setMine((prev) => [...prev, c])} />
      </div>
    </article>
  );
}
