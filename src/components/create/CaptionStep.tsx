"use client";

import { MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Switch } from "@/components/ui/Switch";
import { useAuthStore } from "@/store/auth";
import { DraftPreview } from "./DraftPreview";
import type { Draft } from "./types";

export const CAPTION_LIMIT = 2200;

interface CaptionStepProps {
  draft: Draft;
  caption: string;
  onCaption: (caption: string) => void;
  /** Reels only (a single video): also show it in the feed and the main profile grid. */
  shareToFeed: boolean;
  onShareToFeed: (value: boolean) => void;
}

export function CaptionStep({ draft, caption, onCaption, shareToFeed, onShareToFeed }: CaptionStepProps) {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex w-full flex-col md:h-full md:flex-row">
      <div className="hidden aspect-square md:block md:h-full">
        <DraftPreview draft={draft} />
      </div>
      <div className="flex flex-col md:w-[340px]">
        {user && (
          <div className="flex items-center gap-3 p-4">
            <Avatar src={user.avatar} username={user.username} size="xs" />
            <span className="text-sm font-semibold">{user.username}</span>
          </div>
        )}
        <label htmlFor="caption" className="sr-only">Write a caption</label>
        <textarea
          id="caption"
          data-autofocus
          value={caption}
          onChange={(e) => onCaption(e.target.value.slice(0, CAPTION_LIMIT))}
          placeholder="Write a caption… Use #hashtags and @mentions"
          rows={8}
          className="placeholder:text-muted resize-none bg-transparent px-4 text-sm outline-none"
        />
        <p className="text-muted px-4 py-2 text-right text-xs" aria-live="polite">
          {caption.length.toLocaleString("en-US")}/{CAPTION_LIMIT.toLocaleString("en-US")}
        </p>
        <div className="border-separator text-muted flex items-center justify-between border-y px-4 py-3 text-sm">
          Add location <MapPin aria-hidden className="size-4" />
        </div>
        {draft.video && (
          // A single video becomes a reel; this decides whether it also shows in the feed.
          <div className="border-separator flex items-center justify-between gap-3 border-b px-4 py-3">
            <span className="min-w-0">
              <span id="share-to-feed-label" className="block text-sm">
                Also share to Feed
              </span>
              <span className="text-muted block text-xs">Reels always appear in the Reels tab and on your profile.</span>
            </span>
            <Switch checked={shareToFeed} onChange={onShareToFeed} labelledBy="share-to-feed-label" />
          </div>
        )}
      </div>
    </div>
  );
}
