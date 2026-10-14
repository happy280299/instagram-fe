"use client";

import { type InfiniteData, type QueryClient, type QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { getErrorMessage } from "@/lib/api";
import type { ID, Paginated } from "@/types";
import { useInView } from "./useInView";

interface Options {
  limit: number;
  enabled?: boolean;
}

type Pages<T> = InfiniteData<Paginated<T>, string | null>;

/**
 * Cursor-paginated backend list, cached under `queryKey`. Attach `sentinelRef` to an element at
 * the end of the list; the next page loads when it scrolls into view.
 */
export function usePaginatedQuery<T>(
  queryKey: QueryKey,
  fetchPage: (params: { cursor: string | null; limit: number }) => Promise<Paginated<T>>,
  { limit, enabled = true }: Options,
) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage({ cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    enabled,
  });
  const { data, error, hasNextPage, isFetchingNextPage, isPending, isError, fetchNextPage, refetch } = query;
  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const { ref: sentinelRef, inView } = useInView<HTMLDivElement>({ rootMargin: "600px" });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isError) void fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  return {
    items,
    /** No data yet (includes waiting for `enabled`). */
    initialLoading: isPending,
    loading: isPending || isFetchingNextPage,
    error: isError ? getErrorMessage(error) : null,
    done: !isPending && !isError && !hasNextPage,
    sentinelRef,
    /** Retries whatever failed: the first page or the next one. */
    loadMore: () => void (data ? fetchNextPage() : refetch()),
  };
}

/** Adds an item to the top of a cached paginated list (no-op when the list isn't cached). */
export function prependToPages<T>(client: QueryClient, queryKey: QueryKey, item: T) {
  client.setQueryData<Pages<T>>(queryKey, (old) => {
    if (!old || old.pages.length === 0) return old;
    const [first, ...rest] = old.pages;
    return { ...old, pages: [{ ...first, items: [item, ...first.items] }, ...rest] };
  });
}

/** Removes an item from a cached paginated list; returns the previous data for rollback. */
export function removeFromPages<T extends { id: ID }>(client: QueryClient, queryKey: QueryKey, id: ID) {
  const previous = client.getQueryData<Pages<T>>(queryKey);
  client.setQueryData<Pages<T>>(queryKey, (old) =>
    old ? { ...old, pages: old.pages.map((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) })) } : old,
  );
  return previous;
}
