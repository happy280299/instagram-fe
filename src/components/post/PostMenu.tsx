"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionMenu, type ActionItem } from "@/components/ui/ActionMenu";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import type { PostWithAuthor } from "@/types";
import { useDeletePost } from "./useDeletePost";

const EditPostModal = dynamic(() => import("./EditPostModal").then((m) => m.EditPostModal), { ssr: false });

interface PostMenuProps {
  post: PostWithAuthor;
  open: boolean;
  onClose: () => void;
}

export async function copyToClipboard(path: string) {
  const url = new URL(path, window.location.origin).toString();
  try {
    await navigator.clipboard.writeText(url);
    toast("Link copied to clipboard");
  } catch {
    toast("Couldn't copy link");
  }
}

/** Mock posts have ids like "p1"; only backend posts can be edited or deleted. */
const isBackendPost = (post: PostWithAuthor) => /^\d+$/.test(post.id);

export function PostMenu({ post, open, onClose }: PostMenuProps) {
  const router = useRouter();
  const me = useAuthStore((s) => s.user);
  const following = useAuthStore((s) => s.following[post.authorId] === true);
  const toggleFollow = useAuthStore((s) => s.toggleFollow);
  const deletePost = useDeletePost();
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);
  const isMine = me?.id === post.authorId && isBackendPost(post);

  const actions: ActionItem[] = [
    ...(isMine
      ? [
          { label: "Delete", tone: "danger" as const, onSelect: () => setDialog("delete") },
          { label: "Edit", onSelect: () => setDialog("edit") },
        ]
      : [{ label: "Report", tone: "danger" as const, onSelect: () => toast("Thanks for reporting. We'll review this post.") }]),
    ...(following && !isMine
      ? [{ label: "Unfollow", tone: "danger" as const, onSelect: () => void toggleFollow(post.authorId, post.author.username) }]
      : []),
    { label: "Go to post", onSelect: () => router.push(`/p/${post.id}`) },
    { label: "Copy link", onSelect: () => void copyToClipboard(`/p/${post.id}`) },
  ];

  return (
    <>
      <ActionMenu open={open} onClose={onClose} title="Post options" actions={actions} />
      <ActionMenu
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        title="Delete post?"
        actions={[{ label: "Delete", tone: "danger", onSelect: () => void deletePost(post) }]}
      />
      {dialog === "edit" && <EditPostModal post={post} onClose={() => setDialog(null)} />}
    </>
  );
}
