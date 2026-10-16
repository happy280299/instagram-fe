import type { ReactNode } from "react";
import { ChatUnreadBadge } from "@/components/direct/ChatUnreadBadge";
import { UnreadDot } from "@/components/notification/UnreadDot";

/** Live indicator drawn on a nav icon: unread messages, unread activity. */
export function navBadge(entryId: string): ReactNode {
  if (entryId === "direct") return <ChatUnreadBadge />;
  if (entryId === "notifications") return <UnreadDot />;
  return undefined;
}
