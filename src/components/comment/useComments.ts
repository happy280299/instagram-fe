"use client";

import { useCallback, useMemo } from "react";
import { useInfiniteList, type PageFetcher } from "@/hooks/useInfiniteList";
import { getErrorMessage } from "@/lib/api";
import { commentService } from "@/services/comment.service";
import { toast } from "@/store/ui";
import type { CommentThread, CommentWithAuthor, ID } from "@/types";

const PAGE_SIZE = 20;

/** Paginated comments for a post plus local `add`/`remove` for the viewer's own comments. */
export function useComments(postId: ID) {
  const fetchPage = useCallback<PageFetcher<CommentThread>>(
    ({ cursor, limit }) => commentService.list(postId, { cursor: cursor == null ? null : String(cursor), limit: Number(limit) }),
    [postId],
  );
  const list = useInfiniteList<CommentThread>(fetchPage, { limit: PAGE_SIZE });
  const { items, setItems } = list;

  // A comment added locally shows at the top, then comes back again on the last page.
  const threads = useMemo(() => {
    const seen = new Set<ID>();
    return items.filter((c) => !seen.has(c.id) && seen.add(c.id));
  }, [items]);

  const add = useCallback(
    (comment: CommentWithAuthor) => setItems((prev) => [{ ...comment, replies: [] }, ...prev]),
    [setItems],
  );

  const remove = useCallback(
    async (commentId: ID) => {
      const index = items.findIndex((c) => c.id === commentId);
      if (index === -1) return;
      const removed = items[index];
      setItems((prev) => prev.filter((c) => c.id !== commentId));
      try {
        await commentService.remove(commentId);
        toast("Comment deleted");
      } catch (err) {
        setItems((prev) => [...prev.slice(0, index), removed, ...prev.slice(index)]);
        toast(getErrorMessage(err, "Couldn't delete comment. Try again."));
      }
    },
    [items, setItems],
  );

  return { ...list, items: threads, add, remove };
}
