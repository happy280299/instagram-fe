"use client";

import { MessageCircle } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CommentThread } from "@/types";
import { CommentItem, type ReplyTarget } from "./CommentItem";

interface CommentListProps {
  threads: CommentThread[];
  loading: boolean;
  done: boolean;
  error?: string | null;
  onRetry?: () => void;
  sentinelRef: Ref<HTMLDivElement>;
  onReply: (target: ReplyTarget) => void;
  onDelete?: (commentId: string) => void;
  /** Rendered before the comments (e.g. the caption). */
  lead?: ReactNode;
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3 py-2" aria-hidden>
      <Skeleton rounded="full" className="size-avatar-sm shrink-0" />
      <div className="flex flex-1 flex-col gap-1.5 pt-1">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
    </div>
  );
}

export function CommentList({ threads, loading, done, error, onRetry, sentinelRef, onReply, onDelete, lead }: CommentListProps) {
  return (
    <div aria-busy={loading}>
      <ul aria-label="Comments">
        {lead}
        {threads.map((thread) => (
          <CommentItem key={thread.id} comment={thread} onReply={onReply} onDelete={onDelete} />
        ))}
      </ul>
      {loading && (
        <div role="status" aria-label="Loading comments">
          {Array.from({ length: threads.length === 0 ? 4 : 2 }, (_, i) => (
            <CommentSkeleton key={i} />
          ))}
        </div>
      )}
      {error && (
        <div role="alert" className="flex flex-col items-center gap-2 py-6 text-center">
          <p className="text-muted text-sm">Couldn&apos;t load {threads.length === 0 ? "comments" : "more comments"}.</p>
          {onRetry && (
            <Button size="sm" variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )}
      {done && threads.length === 0 && (
        <div className="text-muted flex flex-col items-center gap-2 py-10 text-center">
          <MessageCircle aria-hidden className="size-10" strokeWidth={1.25} />
          <p className="text-foreground text-xl font-bold">No comments yet.</p>
          <p className="text-sm">Start the conversation.</p>
        </div>
      )}
      <div ref={sentinelRef} aria-hidden className="h-px" />
    </div>
  );
}
