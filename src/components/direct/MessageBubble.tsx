import { cn } from "@/lib/cn";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  mine: boolean;
  pending?: boolean;
  failed?: boolean;
}

const EMOJI_ONLY = /^(\p{Extended_Pictographic}|\p{Emoji_Component}|\s)+$/u;

export function MessageBubble({ message, mine, pending, failed }: MessageBubbleProps) {
  const big = EMOJI_ONLY.test(message.text) && [...message.text.trim()].length <= 6;
  return (
    <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
      <p
        title={new Date(message.createdAt).toLocaleString()}
        className={cn(
          "max-w-[70%] text-sm break-words whitespace-pre-wrap",
          big ? "text-4xl" : cn("rounded-3xl px-3 py-2", mine ? "bg-primary text-on-media" : "bg-hover"),
          pending && "opacity-60",
        )}
      >
        {message.text}
      </p>
      {failed && <span className="text-danger mt-0.5 text-xs">Not delivered</span>}
    </div>
  );
}
