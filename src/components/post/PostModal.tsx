"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import type { PostWithAuthor } from "@/types";
import { PostDetail } from "./PostDetail";

/** Rendered by the intercepting @modal/(.)p/[postId] route. Closing goes back in history. */
export function PostModal({ post }: { post: PostWithAuthor }) {
  const router = useRouter();
  return (
    <Modal
      open
      onClose={() => router.back()}
      title={`Post by ${post.author.username}`}
      hideTitle
      showOverlayClose
      className="max-w-[min(1200px,calc(100vw-2rem))]! w-auto! rounded-sm! md:h-[min(90dvh,800px)] md:max-w-[min(1200px,calc(100vw-8rem))]!"
    >
      <PostDetail post={post} className="h-full" />
    </Modal>
  );
}
