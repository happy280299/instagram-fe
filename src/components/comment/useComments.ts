"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { prependToPages, removeFromPages, usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { commentService } from "@/services/comment.service";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import type { CommentThread, CommentWithAuthor, ID } from "@/types";

const PAGE_SIZE = 20;

/** Paginated comments for a post plus `add`/`remove` for the viewer's own comments. */
export function useComments(postId: ID) {
  const queryClient = useQueryClient();
  // Wait for the session so isMine is the viewer's.
  const hydrated = useAuthStore((s) => s.hydrated);
  const queryKey = queryKeys.comments(postId);
  const list = usePaginatedQuery<CommentThread>(queryKey, (params) => commentService.list(postId, params), { limit: PAGE_SIZE, enabled: hydrated });
  const { items } = list;

  // A comment added locally shows at the top, then comes back again on the last page.
  const threads = useMemo(() => {
    const seen = new Set<ID>();
    return items.filter((c) => !seen.has(c.id) && seen.add(c.id));
  }, [items]);

  const add = useCallback(
    (comment: CommentWithAuthor) => prependToPages<CommentThread>(queryClient, queryKeys.comments(postId), { ...comment, replies: [] }),
    [queryClient, postId],
  );

  const remove = useCallback(
    async (commentId: ID) => {
      const key = queryKeys.comments(postId);
      const previous = removeFromPages<CommentThread>(queryClient, key, commentId);
      try {
        await commentService.remove(commentId);
        toast("Comment deleted");
      } catch (err) {
        queryClient.setQueryData(key, previous);
        toast(getErrorMessage(err, "Couldn't delete comment. Try again."));
      }
    },
    [queryClient, postId],
  );

  return { ...list, items: threads, add, remove };
}
