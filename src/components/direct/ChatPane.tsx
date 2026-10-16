"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNow } from "@/hooks/useNow";
import { activityLabel } from "@/lib/format";
import { useDirectStore } from "@/store/direct";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";
import { OnlineDot } from "./OnlineDot";
import { useConversation } from "./useConversation";
import { markConversationRead } from "./useRealtimeChat";
import { useSendMessage } from "./useSendMessage";

/** The open chat: header, messages and composer. Marks it read on open; the socket keeps it live. */
export function ChatPane({ conversationId }: { conversationId: string }) {
  const queryClient = useQueryClient();
  const { conversation, error, notFound, retry } = useConversation(conversationId);
  const setOpen = useDirectStore((s) => s.setOpenConversation);
  const send = useSendMessage(conversationId);
  const loaded = conversation !== null;
  const now = useNow();

  useEffect(() => {
    setOpen(conversationId);
    return () => setOpen(null);
  }, [conversationId, setOpen]);

  // Opening it reads it, so the other person sees "Seen"; new messages while open are read by the socket handler.
  useEffect(() => {
    if (loaded) markConversationRead(queryClient, conversationId);
  }, [loaded, conversationId, queryClient]);

  if (notFound) return <CenteredNotice title="Conversation not found" />;
  if (error) {
    return (
      <CenteredNotice title="Couldn't load this conversation" detail={error}>
        <Button onClick={retry}>Try again</Button>
      </CenteredNotice>
    );
  }
  if (!conversation) return <ChatSkeleton />;

  const { participant } = conversation;
  // Re-rendered every minute (useNow) so "Active 5m ago" keeps counting without a refetch.
  const activity = activityLabel(conversation.peerPresence, now);
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="border-separator flex items-center gap-3 border-b px-4 py-3">
        <Link href="/direct" aria-label="Back to inbox" className="md:hidden">
          <ArrowLeft aria-hidden className="size-6" />
        </Link>
        <Link href={`/${participant.username}`} className="flex min-w-0 flex-1 items-center gap-3">
          <span className="relative shrink-0">
            <Avatar src={participant.avatar} username={participant.username} size="md" />
            {conversation.peerPresence.isOnline && <OnlineDot />}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{participant.fullName}</span>
            <span className="text-muted block truncate text-xs">{activity ?? participant.username}</span>
          </span>
        </Link>
      </header>
      <MessageList conversation={conversation} />
      <MessageComposer conversationId={conversationId} onSend={(outgoing) => void send(outgoing)} />
    </div>
  );
}

function CenteredNotice({ title, detail, children }: { title: string; detail?: string; children?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-xl font-bold">{title}</p>
      {detail && <p className="text-muted text-sm">{detail}</p>}
      {children ?? (
        <Link href="/direct" className="bg-hover hover:bg-separator inline-flex h-9 items-center rounded-lg px-4 font-semibold">
          Back to inbox
        </Link>
      )}
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div role="status" aria-label="Loading conversation" className="flex min-w-0 flex-1 flex-col">
      <div className="border-separator flex items-center gap-3 border-b px-4 py-3">
        <Skeleton rounded="full" className="size-avatar-md" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2 p-4">
        <Skeleton className="h-8 w-52 rounded-3xl" />
        <Skeleton className="h-8 w-40 self-end rounded-3xl" />
        <Skeleton className="h-8 w-48 rounded-3xl" />
      </div>
    </div>
  );
}
