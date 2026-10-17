"use client";

import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { queryKeys } from "@/lib/query-keys";
import { commentService } from "@/services/comment.service";
import { useUIStore } from "@/store/ui";
import type { CommentThread, CommentWithAuthor } from "@/types";
import { CommentItem, type ReplyTarget } from "./CommentItem";
import { adoptCommentPage } from "./useComments";

const PAGE_SIZE = 10;

interface CommentRepliesProps {
  comment: CommentThread;
  onReply?: (target: ReplyTarget) => void;
  onDelete?: (comment: CommentWithAuthor) => void;
}

/** "View replies (N)" under a top-level comment; backend replies load when opened, mock ones are inline. */
export function CommentReplies({ comment, onReply, onDelete }: CommentRepliesProps) {
  const expanded = useUIStore((s) => s.expandedReplies[comment.id] === true);
  const setExpanded = useUIStore((s) => s.setRepliesExpanded);
  const isBackend = comment.replyCount !== undefined;
  const { items, loading, error, done, sentinelRef, loadMore } = usePaginatedQuery<CommentThread>(
    queryKeys.commentReplies(comment.id),
    (params) => commentService.replies(comment.postId, comment.id, params).then(adoptCommentPage),
    { limit: PAGE_SIZE, enabled: isBackend && expanded },
  );
  const count = isBackend ? (comment.replyCount ?? 0) : comment.replies.length;
  const replies = isBackend ? items : comment.replies;
  if (count === 0 && replies.length === 0) return null;

  return (
    <div className="mt-2 ml-11">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(comment.id, !expanded)}
        className="text-muted flex items-center gap-3 text-xs font-semibold"
      >
        <span aria-hidden className="bg-muted h-px w-6" />
        {expanded ? "Hide replies" : `View replies (${count})`}
      </button>
      {expanded && (
        <ul aria-busy={loading}>
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} onDelete={onDelete} rootId={comment.id} />
          ))}
          {isBackend && loading && <li className="text-muted py-2 text-xs">Loading replies…</li>}
          {isBackend && error && (
            <li className="py-2 text-xs">
              <button type="button" onClick={loadMore} className="text-muted font-semibold hover:opacity-60">
                Couldn&apos;t load replies. Try again
              </button>
            </li>
          )}
          {isBackend && !done && !loading && !error && (
            <li aria-hidden>
              <div ref={sentinelRef} className="h-px" />
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
