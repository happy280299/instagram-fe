"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { cn } from "@/lib/cn";
import { useDirectStore } from "@/store/direct";
import type { ChatConversation, ChatMessage, ID } from "@/types";
import { OnlineDot } from "./OnlineDot";

interface ConversationItemProps {
  conversation: ChatConversation;
  active: boolean;
  viewerId: ID | undefined;
}

/** What the inbox shows for the last message: its text, or what kind of media it was. */
export function messagePreview(message: ChatMessage): string {
  if (message.text) return message.text;
  return message.media?.type === "video" ? "Sent a video" : "Sent a photo";
}

export function ConversationItem({ conversation, active, viewerId }: ConversationItemProps) {
  const { participant, lastMessage, unreadCount } = conversation;
  const typing = useDirectStore((s) => s.typing[conversation.id] === true);
  const unread = unreadCount > 0;
  const prefix = lastMessage?.sender.id === viewerId ? "You: " : "";

  return (
    <li>
      <Link
        href={`/direct/t/${conversation.id}`}
        aria-current={active ? "page" : undefined}
        className={cn("flex items-center gap-3 px-4 py-2 md:px-6", active ? "bg-hover" : "hover:bg-hover")}
      >
        <span className="relative shrink-0">
          <Avatar src={participant.avatar} username={participant.username} size="lg" />
          {conversation.peerPresence.isOnline && <OnlineDot className="right-0.5 bottom-0.5 size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-sm", unread && "font-semibold")}>{participant.fullName}</span>
          <span className={cn("flex gap-1 text-xs", unread ? "text-foreground font-semibold" : "text-muted")}>
            {typing ? (
              <span className="truncate">Typing…</span>
            ) : (
              <>
                <span className="truncate">
                  {unreadCount > 1 ? `${unreadCount} new messages` : lastMessage ? prefix + messagePreview(lastMessage) : "Start a conversation"}
                </span>
                {lastMessage && (
                  <>
                    <span aria-hidden>·</span>
                    <TimeAgo date={lastMessage.createdAt} className="shrink-0" />
                  </>
                )}
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
