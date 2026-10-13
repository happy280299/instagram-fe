"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getErrorMessage, http } from "@/lib/api";
import type { Paginated } from "@/types";
import { useInView } from "./useInView";

type PageParams = Record<string, string | number | null | undefined>;

/** Loads one page; use when the backend's response isn't already a `Paginated<T>`. */
export type PageFetcher<T> = (params: PageParams) => Promise<Paginated<T>>;

interface Options<T> {
  /** Server-rendered first page; when omitted the hook fetches it. */
  initial?: Paginated<T>;
  limit?: number;
  enabled?: boolean;
  /** Extra query params sent with every page request. */
  params?: PageParams;
}

/**
 * Cursor-paginated list backed by an /api endpoint (or a page fetcher). Attach `sentinelRef`
 * to an element at the end of the list; the next page loads when it scrolls into view.
 */
export function useInfiniteList<T>(source: string | PageFetcher<T>, { initial, limit, enabled = true, params }: Options<T> = {}) {
  const [items, setItems] = useState<T[]>(initial?.items ?? []);
  const [cursor, setCursor] = useState<string | null>(initial ? initial.nextCursor : null);
  const [done, setDone] = useState(initial ? initial.nextCursor === null : false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  // Callers may pass an inline fetcher; read it through a ref so loadMore stays stable.
  const fetcher = useRef(source);
  fetcher.current = source;
  // Callers pass inline objects; key on the contents so loadMore stays stable.
  const paramsKey = JSON.stringify(params ?? {});
  const query = useMemo(() => JSON.parse(paramsKey) as NonNullable<Options<T>["params"]>, [paramsKey]);
  const { ref: sentinelRef, inView } = useInView<HTMLDivElement>({ rootMargin: "600px" });

  const loadMore = useCallback(async () => {
    if (inFlight.current || done || !enabled) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const pageParams = { ...query, cursor, limit };
      const fetchPage = fetcher.current;
      const page =
        typeof fetchPage === "string"
          ? await http.get<Paginated<T>>(fetchPage, { params: pageParams })
          : await fetchPage(pageParams);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setDone(page.nextCursor === null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [cursor, done, enabled, limit, query]);

  useEffect(() => {
    if (inView && !error) void loadMore();
  }, [inView, error, loadMore, items.length]);

  const prepend = useCallback((item: T) => setItems((prev) => [item, ...prev]), []);

  return {
    items,
    loading,
    error,
    done,
    initialLoading: loading && items.length === 0,
    sentinelRef,
    loadMore,
    prepend,
    setItems,
  };
}
