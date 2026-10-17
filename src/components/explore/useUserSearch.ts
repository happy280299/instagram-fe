"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounced } from "@/hooks/useDebounced";
import { getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { SEARCH_MAX_LENGTH, userService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth";

/** Wait this long after the last keystroke before searching. */
export const SEARCH_DEBOUNCE_MS = 250;

/** What the backend searches for: like it, ignore a leading "@" (so "@" alone searches nothing). */
export const normalizeSearch = (query: string) => query.trim().replace(/^@+/, "").trim().slice(0, SEARCH_MAX_LENGTH);

/** Debounced user search. Results are cached per query, so going back to an earlier one is instant. */
export function useUserSearch(query: string) {
  // Wait for the session: people the viewer follows rank first.
  const hydrated = useAuthStore((s) => s.hydrated);
  const q = normalizeSearch(query);
  const debounced = useDebounced(q, SEARCH_DEBOUNCE_MS);

  const result = useQuery({
    queryKey: queryKeys.userSearch(debounced.toLowerCase()),
    queryFn: () => userService.search(debounced),
    enabled: hydrated && debounced !== "",
  });
  const settled = q === debounced && !result.isFetching;

  return {
    q,
    users: settled ? (result.data ?? null) : null,
    // Also covers waiting for the session, when the query is disabled and has nothing yet.
    loading: q !== "" && !(settled && (result.data || result.isError)),
    error: settled && result.isError ? getErrorMessage(result.error, "Couldn't search. Try again.") : null,
    retry: () => void result.refetch(),
  };
}
