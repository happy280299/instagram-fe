import type { InfiniteData, QueryKey } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { ID, Paginated, PostWithAuthor } from "@/types";

type PostPages = InfiniteData<Paginated<PostWithAuthor>, string | null>;

/** Every cached list a post can appear in. Prefixes, so they cover each profile and Reels session. */
const POST_LISTS: QueryKey[] = [
  queryKeys.feed,
  queryKeys.allUserPosts,
  queryKeys.allUserReels,
  queryKeys.allReels,
  queryKeys.savedPosts,
  queryKeys.allHashtagPosts,
  queryKeys.explore,
];

const mapPages = (old: PostPages | undefined, fn: (items: PostWithAuthor[]) => PostWithAuthor[]) =>
  old && { ...old, pages: old.pages.map((page) => ({ ...page, items: fn(page.items) })) };

/** Applies a change to one post wherever it's cached: feeds, profile grids, saved, Reels and its detail. */
export function updateCachedPost(postId: ID, update: (post: PostWithAuthor) => PostWithAuthor) {
  for (const queryKey of POST_LISTS) {
    queryClient.setQueriesData<PostPages>({ queryKey }, (old) => mapPages(old, (items) => items.map((p) => (p.id === postId ? update(p) : p))));
  }
  queryClient.setQueryData<PostWithAuthor>(queryKeys.post(postId), (old) => old && update(old));
}

/**
 * Removes a post from every cached list; returns a function that puts them back. Its detail entry
 * stays (an open detail would refetch it before the delete lands); drop it once the delete succeeds.
 */
export function removeCachedPost(postId: ID) {
  const snapshots = POST_LISTS.flatMap((queryKey) => queryClient.getQueriesData({ queryKey }));
  for (const queryKey of POST_LISTS) {
    queryClient.setQueriesData<PostPages>({ queryKey }, (old) => mapPages(old, (items) => items.filter((p) => p.id !== postId)));
  }
  return () => snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
}
