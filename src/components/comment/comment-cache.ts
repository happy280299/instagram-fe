import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { CommentThread, ID, Paginated } from "@/types";

type Pages = InfiniteData<Paginated<CommentThread>, string | null>;

const mapItems = (old: Pages | undefined, fn: (items: CommentThread[], pageIndex: number, pageCount: number) => CommentThread[]) =>
  old && { ...old, pages: old.pages.map((page, i) => ({ ...page, items: fn(page.items, i, old.pages.length) })) };

/** Adds or removes from a top-level comment's reply count, in the post's comment list. */
export function bumpReplyCount(client: QueryClient, postId: ID, commentId: ID, delta: number) {
  client.setQueryData<Pages>(queryKeys.comments(postId), (old) =>
    mapItems(old, (items) => items.map((c) => (c.id === commentId ? { ...c, replyCount: Math.max((c.replyCount ?? 0) + delta, 0) } : c))),
  );
}

/** Puts a new reply at the end of its loaded replies (oldest first, like the backend). No-op if they aren't loaded. */
export function appendReply(client: QueryClient, reply: CommentThread) {
  if (!reply.parentId) return;
  client.setQueryData<Pages>(queryKeys.commentReplies(reply.parentId), (old) =>
    mapItems(old, (items, i, count) => (i === count - 1 ? [...items.filter((r) => r.id !== reply.id), reply] : items)),
  );
}

/** Removes a comment from a cached list; returns the previous pages for rollback. */
export function removeFromList(client: QueryClient, key: readonly unknown[], commentId: ID) {
  const previous = client.getQueryData<Pages>(key);
  client.setQueryData<Pages>(key, (old) => mapItems(old, (items) => items.filter((c) => c.id !== commentId)));
  return previous;
}
