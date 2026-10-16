"use client";

import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { compactNumber } from "@/lib/format";
import type { FeedPost } from "@/services/feed.service";
import { usePostStore } from "@/store/post";
import { useUIStore } from "@/store/ui";

function Action({ label, count, onClick, pressed, children }: { label: string; count?: string; onClick: () => void; pressed?: boolean; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={pressed} className="flex flex-col items-center gap-1 hover:opacity-70">
      {children}
      {count && <span className="text-xs font-semibold">{count}</span>}
    </button>
  );
}

/** Like, comment, share and save for a reel; the same post APIs and stores as the feed. */
export function ReelActions({ reel }: { reel: FeedPost }) {
  const liked = usePostStore((s) => s.liked[reel.id] === true);
  const saved = usePostStore((s) => s.saved.includes(reel.id));
  const toggleLike = usePostStore((s) => s.toggleLike);
  const toggleSave = usePostStore((s) => s.toggleSave);
  const openComments = useUIStore((s) => s.openComments);
  const openShare = useUIStore((s) => s.openShare);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Mapped counts exclude the viewer's own like; add it back from the store. */}
      <Action label={liked ? "Unlike" : "Like"} pressed={liked} count={compactNumber(reel.likes + (liked ? 1 : 0))} onClick={() => void toggleLike(reel.id)}>
        <Heart aria-hidden className={cn("size-7", liked && "animate-like fill-like text-like")} />
      </Action>
      <Action label="Comment" count={compactNumber(reel.commentsCount)} onClick={() => openComments(reel.id)}>
        <MessageCircle aria-hidden className="size-7 -scale-x-100" />
      </Action>
      <Action label="Share reel" onClick={() => openShare({ path: `/reels?r=${reel.id}`, title: "Share" })}>
        <Send aria-hidden className="size-7" />
      </Action>
      <Action label={saved ? "Remove from saved" : "Save"} pressed={saved} onClick={() => void toggleSave(reel.id)}>
        <Bookmark aria-hidden className={cn("size-7", saved && "fill-current")} />
      </Action>
    </div>
  );
}
