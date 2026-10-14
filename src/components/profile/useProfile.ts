"use client";

import { useQuery } from "@tanstack/react-query";
import { getErrorMessage, HttpError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth";

async function fetchProfile(username: string) {
  const profile = await userService.profile(username);
  if (profile.isFollowing) useAuthStore.getState().syncFollowing([profile.user.id]);
  return profile;
}

/** A backend profile (GET /api/users/:username). Waits for the session so isFollowing/isMe are the viewer's. */
export function useProfile(username: string) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const key = username.toLowerCase();
  const query = useQuery({
    queryKey: queryKeys.profile(key),
    queryFn: () => fetchProfile(key),
    enabled: hydrated,
  });

  return {
    profile: query.data ?? null,
    error: query.isError && !query.isFetching ? getErrorMessage(query.error, "Couldn't load this profile.") : null,
    notFound: query.error instanceof HttpError && query.error.status === 404,
    retry: () => void query.refetch(),
  };
}
