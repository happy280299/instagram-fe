"use client";

import { useQuery } from "@tanstack/react-query";
import { getErrorMessage, HttpError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { conversationService } from "@/services/conversation.service";
import { useAuthStore } from "@/store/auth";
import type { ID } from "@/types";

const BACKEND_ID = /^\d+$/;

/** One conversation (GET /api/conversations/:id). Not a member and not found both come back as 404. */
export function useConversation(id: ID) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isLoggedIn = useAuthStore((s) => s.accessToken !== null);
  const isValidId = BACKEND_ID.test(id);
  const query = useQuery({
    queryKey: queryKeys.conversation(id),
    queryFn: () => conversationService.get(id),
    enabled: hydrated && isLoggedIn && isValidId,
  });
  return {
    conversation: query.data ?? null,
    error: query.isError && !query.isFetching ? getErrorMessage(query.error, "Couldn't load this conversation.") : null,
    notFound: !isValidId || (query.error instanceof HttpError && query.error.status === 404),
    retry: () => void query.refetch(),
  };
}
