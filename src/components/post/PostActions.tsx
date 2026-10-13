"use client";

import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { fullNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { usePostStore } from "@/store/post";
import { useUIStore } from "@/store/ui";
import type { Post } from "@/types";

interface PostActionsProps {
  post: Pick<Post, "id" | "likes">;
  onComment?: () => void;
}

export function PostActions({ post, onComment }: PostActionsProps) {
  const liked = usePostStore((s) => s.liked[post.id] === true);
  const saved = usePostStore((s) => s.saved.includes(post.id));
  const toggleLike = usePostStore((s) => s.toggleLike);
  const toggleSave = usePostStore((s) => s.toggleSave);
  const openComments = useUIStore((s) => s.openComments);
  const openShare = useUIStore((s) => s.openShare);
  const likes = post.likes + (liked ? 1 : 0);

  return (
    <div>
      <div className="-ml-2 flex items-center">
        <IconButton label={liked ? "Unlike" : "Like"} aria-pressed={liked} onClick={() => void toggleLike(post.id)}>
          <Heart
            aria-hidden
            key={String(liked)}
            className={cn("size-6", liked && "animate-like fill-like text-like")}
          />
        </IconButton>
        <IconButton label="Comment" onClick={onComment ?? (() => openComments(post.id))}>
          <MessageCircle aria-hidden className="size-6 -scale-x-100" />
        </IconButton>
        <IconButton label="Share post" onClick={() => openShare({ path: `/p/${post.id}`, title: "Share" })}>
          <Send aria-hidden className="size-6" />
        </IconButton>
        <IconButton
          label={saved ? "Remove from saved" : "Save"}
          aria-pressed={saved}
          className="ml-auto"
          onClick={() => void toggleSave(post.id)}
        >
          <Bookmark aria-hidden className={cn("size-6", saved && "fill-foreground")} />
        </IconButton>
      </div>
      <p className="text-sm font-semibold">
        {likes === 0 ? "Be the first to like this" : `${fullNumber(likes)} ${likes === 1 ? "like" : "likes"}`}
      </p>
    </div>
  );
}
