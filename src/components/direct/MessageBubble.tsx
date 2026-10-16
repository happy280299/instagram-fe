"use client";

import { Undo2 } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  mine: boolean;
  /** Shown under the message, e.g. "Seen". */
  footnote?: string;
  onUnsend?: () => void;
}

const EMOJI_ONLY = /^(\p{Extended_Pictographic}|\p{Emoji_Component}|\s)+$/u;
const MAX_MEDIA_PX = 240;

/** Bounded box for a photo/video that keeps its shape; square when the size isn't known (an optimistic upload). */
function mediaBox(width: number | null, height: number | null) {
  if (!width || !height) return { width: MAX_MEDIA_PX, height: MAX_MEDIA_PX };
  const scale = Math.min(MAX_MEDIA_PX / width, MAX_MEDIA_PX / height, 1);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export function MessageBubble({ message, mine, footnote, onUnsend }: MessageBubbleProps) {
  const { text, media, status } = message;
  const big = !media && text !== null && EMOJI_ONLY.test(text) && [...text.trim()].length <= 6;
  const box = media && mediaBox(media.width, media.height);

  return (
    <div className={cn("group flex flex-col", mine ? "items-end" : "items-start")}>
      <div className={cn("flex max-w-[75%] items-center gap-1", mine && "flex-row-reverse")}>
        <div title={new Date(message.createdAt).toLocaleString()} className={cn("flex flex-col gap-1", status === "sending" && "opacity-60")}>
          {media && box && (
            <div className="bg-skeleton relative overflow-hidden rounded-2xl" style={{ width: box.width, height: box.height, maxWidth: "100%" }}>
              {media.type === "video" ? (
                <video src={media.url} poster={media.poster} controls playsInline preload="metadata" className="h-full w-full object-cover" />
              ) : (
                <SafeImage src={media.url} alt={`Photo from ${message.sender.username}`} fill sizes={`${MAX_MEDIA_PX}px`} className="object-cover" />
              )}
            </div>
          )}
          {text && (
            <p
              className={cn(
                "text-sm wrap-break-word whitespace-pre-wrap",
                big ? "text-4xl" : cn("rounded-3xl px-3 py-2", mine ? "bg-primary text-on-media" : "bg-hover"),
              )}
            >
              {text}
            </p>
          )}
        </div>
        {onUnsend && (
          <button
            type="button"
            onClick={onUnsend}
            aria-label="Unsend message"
            title="Unsend"
            className="text-muted hover:text-foreground shrink-0 rounded-full p-1.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Undo2 aria-hidden className="size-4" />
          </button>
        )}
      </div>
      {status === "failed" && <span className="text-danger mt-0.5 text-xs">Not delivered</span>}
      {footnote && !status && <span className="text-muted mt-0.5 text-xs">{footnote}</span>}
    </div>
  );
}
