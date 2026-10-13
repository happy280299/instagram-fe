"use client";

import { Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import type { ReactNode } from "react";
import { compactNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { usePostStore } from "@/store/post";
import { toast, useUIStore } from "@/store/ui";
import type { ReelWithAuthor } from "@/types";

function Action({ label, count, onClick, pressed, children }: { label: string; count?: string; onClick: () => void; pressed?: boolean; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={pressed} className="flex flex-col items-center gap-1 hover:opacity-70">
      {children}
      {count && <span className="text-xs font-semibold">{count}</span>}
    </button>
  );
}

export function ReelActions({ reel }: { reel: ReelWithAuthor }) {
  const liked = usePostStore((s) => s.liked[reel.id] === true);
  const toggleLike = usePostStore((s) => s.toggleLike);
  const openComments = useUIStore((s) => s.openComments);
  const openShare = useUIStore((s) => s.openShare);

  return (
    <div className="flex flex-col items-center gap-5">
      <Action label={liked ? "Unlike" : "Like"} pressed={liked} count={compactNumber(reel.likes + (liked ? 1 : 0))} onClick={() => void toggleLike(reel.id)}>
        <Heart aria-hidden className={cn("size-7", liked && "animate-like fill-like text-like")} />
      </Action>
      <Action label="Comment" count={compactNumber(reel.commentsCount)} onClick={() => openComments(reel.id)}>
        <MessageCircle aria-hidden className="size-7 -scale-x-100" />
      </Action>
      <Action label="Share reel" onClick={() => openShare({ path: `/reels?r=${reel.id}`, title: "Share" })}>
        <Send aria-hidden className="size-7" />
      </Action>
      <Action label="More options" onClick={() => toast("More reel options aren't available in this demo")}>
        <MoreHorizontal aria-hidden className="size-7" />
      </Action>
    </div>
  );
}
