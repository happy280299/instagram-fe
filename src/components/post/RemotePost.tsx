"use client";

import { ErrorView } from "@/components/ui/ErrorView";
import { NotFoundView } from "@/components/ui/NotFoundView";
import type { ID } from "@/types";
import { PostDetail } from "./PostDetail";
import { PostModal } from "./PostModal";
import { PostDetailSkeleton } from "./PostSkeleton";
import { usePost } from "./usePost";

const PAGE_FRAME = "border-separator md:h-[min(80dvh,700px)] md:border";

/**
 * A backend post, loaded on the client because the session (and so isLiked/isSaved) lives in
 * localStorage. Used by /p/[postId] and its intercepted modal when the id isn't a mock post.
 */
export function RemotePost({ postId, inModal = false }: { postId: ID; inModal?: boolean }) {
  const { post, error, notFound, retry } = usePost(postId);
  const frame = inModal ? "h-full" : PAGE_FRAME;

  let body;
  if (post) body = <PostDetail post={post} className={frame} />;
  else if (notFound) body = <NotFoundView title="This post isn't available." />;
  else if (error) body = <ErrorView title="Couldn't load this post" description={error} onRetry={retry} />;
  else body = <PostDetailSkeleton className={frame} />;

  if (inModal) return <PostModal label={post ? `Post by ${post.author.username}` : "Post"}>{body}</PostModal>;
  return <div className="max-w-content mx-auto w-full md:px-5 md:pt-8">{body}</div>;
}
