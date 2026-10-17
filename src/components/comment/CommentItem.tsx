"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { RichText } from "@/components/ui/RichText";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { cn } from "@/lib/cn";
import { pluralize } from "@/lib/format";
import { usePostStore } from "@/store/post";
import type { CommentThread, CommentWithAuthor } from "@/types";
import { CommentReplies } from "./CommentReplies";

export interface ReplyTarget {
  commentId: string;
  username: string;
}

interface CommentItemProps {
  comment: CommentWithAuthor | CommentThread;
  onReply?: (target: ReplyTarget) => void;
  /** Shown for the viewer's own comments. */
  onDelete?: (comment: CommentWithAuthor) => void;
  /** Top-level id replies attach to (Instagram flattens nested replies). */
  rootId?: string;
}

export function CommentItem({ comment, onReply, onDelete, rootId }: CommentItemProps) {
  const liked = usePostStore((s) => s.likedComments[comment.id] === true);
  const toggle = usePostStore((s) => s.toggleCommentLike);
  const likes = comment.likes + (liked ? 1 : 0);

  return (
    <li className="py-2">
      <div className="flex gap-3">
        <Link href={`/${comment.author.username}`} aria-hidden tabIndex={-1} className="shrink-0">
          <Avatar src={comment.author.avatar} username={comment.author.username} size="sm" />
        </Link>
        <div className="min-w-0 flex-1 text-sm">
          <p className="wrap-break-word">
            <Link href={`/${comment.author.username}`} className="mr-1 font-semibold hover:opacity-60">
              {comment.author.username}
            </Link>
            <RichText text={comment.text} />
          </p>
          <div className="text-muted mt-1 flex gap-3 text-xs">
            <TimeAgo date={comment.createdAt} />
            {likes > 0 && <span className="font-semibold">{pluralize(likes, "like")}</span>}
            {onReply && (
              <button
                type="button"
                className="font-semibold hover:opacity-60"
                onClick={() => onReply({ commentId: rootId ?? comment.id, username: comment.author.username })}
              >
                Reply
              </button>
            )}
            {onDelete && comment.isMine && (
              <button type="button" className="font-semibold hover:opacity-60" onClick={() => onDelete(comment)}>
                Delete
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void toggle(comment.id)}
          aria-label={liked ? "Unlike comment" : "Like comment"}
          aria-pressed={liked}
          className="shrink-0 self-center p-1 hover:opacity-60"
        >
          <Heart aria-hidden className={cn("size-3", liked && "animate-like fill-like text-like")} />
        </button>
      </div>
      {"replies" in comment && <CommentReplies comment={comment} onReply={onReply} onDelete={onDelete} />}
    </li>
  );
}
