"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FollowButton } from "@/components/user/FollowButton";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useHydrated } from "@/hooks/useHydrated";
import { useAuthStore } from "@/store/auth";
import type { PostWithAuthor } from "@/types";
import { PostMenu } from "./PostMenu";

export function PostHeader({ post, showTime = true }: { post: PostWithAuthor; showTime?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hydrated = useHydrated();
  const following = useAuthStore((s) => s.following[post.authorId] === true);
  const isMe = useAuthStore((s) => s.user?.id === post.authorId);
  const { author } = post;

  return (
    <header className="flex items-center gap-3 py-3 pr-1 pl-3 md:pl-0">
      <Link href={`/${author.username}`} tabIndex={-1} aria-hidden>
        <Avatar src={author.avatar} username={author.username} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-sm">
          <Link href={`/${author.username}`} className="truncate font-semibold hover:opacity-60">
            {author.username}
          </Link>
          {author.isVerified && <VerifiedBadge />}
          {showTime && (
            <>
              <span aria-hidden className="text-muted">•</span>
              <TimeAgo date={post.createdAt} className="text-muted" />
            </>
          )}
          {hydrated && !following && !isMe && (
            <>
              <span aria-hidden className="text-muted">•</span>
              <FollowButton user={author} variant="text" className="text-sm" />
            </>
          )}
        </div>
        {post.location && <p className="truncate text-xs">{post.location}</p>}
      </div>
      <IconButton label="More options" onClick={() => setMenuOpen(true)}>
        <MoreHorizontal aria-hidden className="size-6" />
      </IconButton>
      <PostMenu post={post} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
