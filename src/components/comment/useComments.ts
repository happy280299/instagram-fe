"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { prependToPages, usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { commentService, type MappedComment } from "@/services/comment.service";
import { useAuthStore } from "@/store/auth";
import { usePostStore } from "@/store/post";
import { toast, useUIStore } from "@/store/ui";
import type { CommentThread, CommentWithAuthor, ID, Paginated } from "@/types";
import { appendReply, bumpReplyCount, removeFromList } from "./comment-cache";

const PAGE_SIZE = 20;

/** Keeps the store's liked flags in step with what the server says, and hands back plain comments. */
export function adoptCommentPage(page: Paginated<MappedComment>): Paginated<CommentThread> {
  usePostStore.getState().syncCommentLikes(page.items.map((m) => ({ id: m.comment.id, liked: m.isLiked })));
  return { items: page.items.map((m) => m.comment), nextCursor: page.nextCursor };
}

/** Top-level comments of a post plus `add`/`remove` for the viewer's own comments and replies. */
export function useComments(postId: ID) {
  const queryClient = useQueryClient();
  // Wait for the session so isMine / isLiked are the viewer's.
  const hydrated = useAuthStore((s) => s.hydrated);
  const list = usePaginatedQuery<CommentThread>(
    queryKeys.comments(postId),
    (params) => commentService.list(postId, params).then(adoptCommentPage),
    { limit: PAGE_SIZE, enabled: hydrated },
  );
  const { items } = list;

  // A comment added locally shows at the top, then comes back again on the last page.
  const threads = useMemo(() => {
    const seen = new Set<ID>();
    return items.filter((c) => !seen.has(c.id) && seen.add(c.id));
  }, [items]);

  const add = useCallback(
    (comment: CommentWithAuthor) => {
      const thread: CommentThread = { ...comment, replies: [] };
      if (!comment.parentId) return prependToPages<CommentThread>(queryClient, queryKeys.comments(postId), thread);
      // A reply: under its comment, with the replies opened so you see it.
      appendReply(queryClient, thread);
      bumpReplyCount(queryClient, postId, comment.parentId, 1);
      useUIStore.getState().setRepliesExpanded(comment.parentId, true);
    },
    [queryClient, postId],
  );

  const remove = useCallback(
    async (comment: CommentWithAuthor) => {
      const key = comment.parentId ? queryKeys.commentReplies(comment.parentId) : queryKeys.comments(postId);
      const previous = removeFromList(queryClient, key, comment.id);
      if (comment.parentId) bumpReplyCount(queryClient, postId, comment.parentId, -1);
      try {
        await commentService.remove(comment.id);
        toast("Comment deleted");
      } catch (err) {
        queryClient.setQueryData(key, previous);
        if (comment.parentId) bumpReplyCount(queryClient, postId, comment.parentId, 1);
        toast(getErrorMessage(err, "Couldn't delete comment. Try again."));
      }
    },
    [queryClient, postId],
  );

  return { ...list, items: threads, add, remove };
}
