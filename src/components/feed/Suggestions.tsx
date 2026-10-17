"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/Skeleton";
import { UserListItem } from "@/components/user/UserListItem";
import { queryKeys } from "@/lib/query-keys";
import { type SuggestedUser, userService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth";

const LIMIT = 5;

/** Why someone is suggested, as Instagram words it. */
function reason(user: SuggestedUser): string {
  if (user.followsYou) return "Follows you";
  const [first] = user.mutuals;
  if (first && user.mutualCount > 1) return `Followed by ${first} + ${user.mutualCount - 1} more`;
  if (first) return `Followed by ${first}`;
  return "Suggested for you";
}

/** "Suggested for you" in the feed's right column (GET /api/users/suggestions). */
export function Suggestions() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isLoggedIn = useAuthStore((s) => s.accessToken !== null);
  const query = useQuery({ queryKey: queryKeys.suggestions, queryFn: () => userService.suggestions(LIMIT), enabled: hydrated && isLoggedIn });
  if (!isLoggedIn) return null;

  return (
    <section aria-labelledby="suggestions-title" className="mt-4">
      <h2 id="suggestions-title" className="text-muted mb-2 text-sm font-semibold">
        Suggested for you
      </h2>
      {query.isPending ? (
        <div role="status" aria-label="Loading suggestions">
          {Array.from({ length: LIMIT }, (_, i) => (
            <div key={i} className="flex items-center gap-3 py-2" aria-hidden>
              <Skeleton rounded="full" className="size-avatar-md" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <p className="text-muted py-2 text-sm">
          Couldn&apos;t load suggestions.{" "}
          <button type="button" onClick={() => void query.refetch()} className="text-primary font-semibold hover:opacity-70">
            Try again
          </button>
        </p>
      ) : query.data.length === 0 ? (
        <p className="text-muted py-2 text-sm">No suggestions right now.</p>
      ) : (
        <ul>
          {query.data.map((u) => (
            <UserListItem key={u.id} user={u} subtitle={reason(u)} />
          ))}
        </ul>
      )}
    </section>
  );
}
