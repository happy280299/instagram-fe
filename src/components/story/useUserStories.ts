"use client";

import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { storyService } from "@/services/story.service";
import type { ID } from "@/types";

/** Loads one user's active stories when their avatar is opened in the story viewer. */
export function useUserStories(userId: ID) {
  const query = useQuery({ queryKey: queryKeys.userStories(userId), queryFn: () => storyService.byUser(userId) });
  return {
    data: query.data ?? null,
    error: query.isError && !query.isFetching ? getErrorMessage(query.error, "Couldn't load this story.") : null,
    retry: () => void query.refetch(),
  };
}
