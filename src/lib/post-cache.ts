import type { InfiniteData } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { ID, Paginated, PostWithAuthor } from "@/types";

type PostPages = InfiniteData<Paginated<PostWithAuthor>, string | null>;

/** Applies a change to one post wherever it's cached: the feed, every profile grid and its detail. */
export function updateCachedPost(postId: ID, update: (post: PostWithAuthor) => PostWithAuthor) {
  const updatePages = (old: PostPages | undefined) =>
    old && { ...old, pages: old.pages.map((page) => ({ ...page, items: page.items.map((p) => (p.id === postId ? update(p) : p)) })) };
  queryClient.setQueriesData<PostPages>({ queryKey: queryKeys.feed }, updatePages);
  queryClient.setQueriesData<PostPages>({ queryKey: queryKeys.allUserPosts }, updatePages);
  queryClient.setQueryData<PostWithAuthor>(queryKeys.post(postId), (old) => old && update(old));
}
