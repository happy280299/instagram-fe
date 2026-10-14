import { QueryClient } from "@tanstack/react-query";
import { HttpError } from "@/lib/api";

const MAX_RETRIES = 1;

/** Client-side cache for backend data. Every request needs the session from localStorage, so there is no server cache. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Revisiting a screen within a minute shows cached data with no refetch.
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      // A 4xx (404, 401, validation) won't succeed on retry.
      retry: (failures, error) => !(error instanceof HttpError && error.status >= 400 && error.status < 500) && failures < MAX_RETRIES,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Call when the session changes (login, logout): cached data holds the previous viewer's
 * isLiked/isFollowing/isMe. Screens on view refetch; everything else is dropped.
 */
export function resetServerState() {
  queryClient.removeQueries({ type: "inactive" });
  void queryClient.resetQueries({ type: "active" });
}
