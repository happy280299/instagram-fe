"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounced } from "@/hooks/useDebounced";
import { getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { hashtagService } from "@/services/hashtag.service";
import { SEARCH_DEBOUNCE_MS } from "./useUserSearch";

/** Hashtag suggestions for a "#…" query in the search panel. */
export function useHashtagSearch(query: string) {
  const q = query.trim().replace(/^#+/, "").toLowerCase().normalize("NFC").slice(0, 50);
  const debounced = useDebounced(q, SEARCH_DEBOUNCE_MS);
  const result = useQuery({
    queryKey: queryKeys.hashtagSearch(debounced),
    queryFn: () => hashtagService.search(debounced),
    enabled: debounced !== "",
  });
  const settled = q === debounced && !result.isFetching;
  return {
    q,
    tags: settled ? (result.data ?? null) : null,
    loading: q !== "" && !(settled && (result.data || result.isError)),
    error: settled && result.isError ? getErrorMessage(result.error, "Couldn't search hashtags. Try again.") : null,
    retry: () => void result.refetch(),
  };
}
