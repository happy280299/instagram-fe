"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { storyService } from "@/services/story.service";
import { useAuthStore } from "@/store/auth";
import type { ID, StoryTrayItem } from "@/types";

/** The story bar's users. Logging in or out resets the cache, since the tray depends on who follows whom. */
export function useStoryTray() {
  // Wait for the persisted session so the request carries the Bearer token.
  const hydrated = useAuthStore((s) => s.hydrated);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.storyTray, queryFn: storyService.tray, enabled: hydrated });

  const markUserSeen = useCallback(
    (userId: ID) =>
      queryClient.setQueryData<StoryTrayItem[]>(queryKeys.storyTray, (items) =>
        items?.map((i) => (i.user.id === userId ? { ...i, hasUnseen: false } : i)),
      ),
    [queryClient],
  );

  return {
    items: query.data ?? null,
    error: query.isError && !query.isFetching ? getErrorMessage(query.error, "Couldn't load stories.") : null,
    loading: !query.data && (query.isPending || query.isFetching),
    retry: () => void query.refetch(),
    markUserSeen,
  };
}
