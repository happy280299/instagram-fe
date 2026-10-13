import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { cn } from "@/lib/cn";
import type { ConversationPreview, ID } from "@/types";

interface ConversationItemProps {
  conversation: ConversationPreview;
  active: boolean;
  viewerId: ID | undefined;
}

export function ConversationItem({ conversation, active, viewerId }: ConversationItemProps) {
  const { participant, lastMessage, unread } = conversation;
  const prefix = lastMessage?.senderId === viewerId ? "You: " : "";
  return (
    <li>
      <Link
        href={`/direct/t/${conversation.id}`}
        aria-current={active ? "page" : undefined}
        className={cn("flex items-center gap-3 px-4 py-2 md:px-6", active ? "bg-hover" : "hover:bg-hover")}
      >
        <Avatar src={participant.avatar} username={participant.username} size="lg" />
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-sm", unread && "font-semibold")}>{participant.fullName}</span>
          <span className={cn("flex gap-1 text-xs", unread ? "text-foreground font-semibold" : "text-muted")}>
            <span className="truncate">
              {prefix}
              {lastMessage?.text ?? "Start a conversation"}
            </span>
            {lastMessage && (
              <>
                <span aria-hidden>·</span>
                <TimeAgo date={lastMessage.createdAt} className="shrink-0" />
              </>
            )}
          </span>
        </span>
        {unread && (
          <span className="bg-primary size-2 shrink-0 rounded-full">
            <span className="sr-only">Unread</span>
          </span>
        )}
      </Link>
    </li>
  );
}
