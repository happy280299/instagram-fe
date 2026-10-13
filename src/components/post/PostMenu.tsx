"use client";

import { useRouter } from "next/navigation";
import { ActionMenu, type ActionItem } from "@/components/ui/ActionMenu";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import type { PostWithAuthor } from "@/types";

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

export function PostMenu({ post, open, onClose }: PostMenuProps) {
  const router = useRouter();
  const me = useAuthStore((s) => s.user);
  const following = useAuthStore((s) => s.following[post.authorId] === true);
  const toggleFollow = useAuthStore((s) => s.toggleFollow);

  const actions: ActionItem[] = [
    { label: "Report", tone: "danger", onSelect: () => toast("Thanks for reporting. We'll review this post.") },
    ...(following && me?.id !== post.authorId
      ? [{ label: "Unfollow", tone: "danger" as const, onSelect: () => void toggleFollow(post.authorId, post.author.username) }]
      : []),
    { label: "Go to post", onSelect: () => router.push(`/p/${post.id}`) },
    { label: "Copy link", onSelect: () => void copyToClipboard(`/p/${post.id}`) },
  ];

  return <ActionMenu open={open} onClose={onClose} title="Post options" actions={actions} />;
}
