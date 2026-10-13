"use client";

import { useRef, useState } from "react";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { cn } from "@/lib/cn";
import { usePostStore } from "@/store/post";
import type { PostWithAuthor } from "@/types";
import { AddComment } from "@/components/comment/AddComment";
import { CaptionComment } from "@/components/comment/CaptionComment";
import type { ReplyTarget } from "@/components/comment/CommentItem";
import { CommentList } from "@/components/comment/CommentList";
import { PostActions } from "./PostActions";
import { PostHeader } from "./PostHeader";
import { mediaRatio, PostMedia } from "./PostMedia";
import { useComments } from "@/components/comment/useComments";

interface PostDetailProps {
  post: PostWithAuthor;
  className?: string;
}

/** Two-pane post view shared by the intercepted modal and the full /p/[id] page. */
export function PostDetail({ post, className }: PostDetailProps) {
  const comments = useComments(post.id);
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const setLike = usePostStore((s) => s.setLike);

  return (
    <article
      aria-label={`Post by ${post.author.username}`}
      className={cn("bg-elevated flex flex-col overflow-y-auto md:flex-row md:overflow-hidden", className)}
    >
      <div className="relative shrink-0 bg-black md:h-full md:max-w-[60%]" style={{ aspectRatio: mediaRatio(post.media) }}>
        <PostMedia media={post.media} fill priority sizes="(max-width: 767px) 100vw, 60vw" onDoubleTap={() => void setLike(post.id, true)} />
      </div>
      <div className="border-separator flex min-w-0 flex-1 flex-col md:min-h-0 md:w-[335px] md:border-l lg:w-[405px] lg:flex-none">
        <div className="border-separator border-b md:px-4">
          <PostHeader post={post} showTime={false} />
        </div>
        <div className="flex-1 px-4 md:overflow-y-auto">
          <CommentList
            threads={comments.items}
            loading={comments.loading}
            done={comments.done}
            sentinelRef={comments.sentinelRef}
            onDelete={(id) => void comments.remove(id)}
            onReply={(target) => {
              setReplyTo(target);
              inputRef.current?.focus();
            }}
            lead={<CaptionComment post={post} />}
          />
        </div>
        <div className="border-separator border-t px-4 py-1">
          <PostActions post={post} onComment={() => inputRef.current?.focus()} />
          <TimeAgo date={post.createdAt} variant="long" className="text-muted mb-1 block text-xs uppercase" />
        </div>
        <div className="border-separator border-t px-4">
          {replyTo && (
            <p className="text-muted flex justify-between pt-2 text-xs">
              Replying to @{replyTo.username}
              <button type="button" onClick={() => setReplyTo(null)} className="font-semibold">
                Cancel
              </button>
            </p>
          )}
          <AddComment
            key={replyTo?.commentId ?? "root"}
            postId={post.id}
            defaultText={replyTo ? `@${replyTo.username} ` : ""}
            inputRef={inputRef}
            onAdded={(c) => {
              comments.add(c);
              setReplyTo(null);
            }}
          />
        </div>
      </div>
    </article>
  );
}
