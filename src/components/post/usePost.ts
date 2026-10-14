"use client";

import { useQuery } from "@tanstack/react-query";
import { getErrorMessage, HttpError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { postService } from "@/services/post.service";
import { useAuthStore } from "@/store/auth";
import { usePostStore } from "@/store/post";
import type { ID } from "@/types";

const BACKEND_ID = /^\d+$/;

async function fetchPost(postId: ID) {
  const post = await postService.getById(postId);
  usePostStore.getState().syncViewerState([{ id: post.id, ...post.viewer }]);
  if (post.viewer.followsAuthor) useAuthStore.getState().syncFollowing([post.authorId]);
  return post;
}

/** One backend post (GET /api/posts/:id). Waits for the session so isLiked/isSaved are the viewer's. */
export function usePost(postId: ID) {
  const hydrated = useAuthStore((s) => s.hydrated);
  // A malformed id can't exist on the backend; don't send it.
  const isValidId = BACKEND_ID.test(postId);
  const query = useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: () => fetchPost(postId),
    enabled: hydrated && isValidId,
  });

  return {
    post: query.data ?? null,
    error: query.isError && !query.isFetching ? getErrorMessage(query.error, "Couldn't load this post.") : null,
    notFound: !isValidId || (query.error instanceof HttpError && query.error.status === 404),
    retry: () => void query.refetch(),
  };
}
