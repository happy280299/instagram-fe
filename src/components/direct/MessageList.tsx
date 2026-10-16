"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { conversationService, isReadUpTo } from "@/services/conversation.service";
import { useAuthStore } from "@/store/auth";
import { useDirectStore } from "@/store/direct";
import { toast } from "@/store/ui";
import type { ChatConversation, ChatMessage } from "@/types";
import { removeMessage } from "./chat-cache";
import { MessageBubble } from "./MessageBubble";

const PAGE_SIZE = 30;

/**
 * Messages of one conversation, newest at the bottom. The list is column-reverse in the newest-first
 * order the API returns, so the view starts at the bottom and loading older ones (scroll up) doesn't jump.
 */
export function MessageList({ conversation }: { conversation: ChatConversation }) {
  const queryClient = useQueryClient();
  const myId = useAuthStore((s) => s.user?.id);
  const typing = useDirectStore((s) => s.typing[conversation.id] === true);
  const [unsending, setUnsending] = useState<ChatMessage | null>(null);
  const { items, loading, error, done, sentinelRef, loadMore } = usePaginatedQuery<ChatMessage>(
    queryKeys.messages(conversation.id),
    (params) => conversationService.messages(conversation.id, params),
    { limit: PAGE_SIZE },
  );
  const { participant } = conversation;
  // "Seen" goes under your newest message once the other person has read up to it.
  const lastMine = items.find((m) => m.sender.id === myId && !m.status);

  async function unsend(message: ChatMessage) {
    const previous = removeMessage(queryClient, conversation.id, message.id);
    try {
      await conversationService.remove(message.id);
    } catch (err) {
      queryClient.setQueryData(queryKeys.messages(conversation.id), previous);
      toast(getErrorMessage(err, "Couldn't unsend the message."));
    }
  }

  return (
    <div className="flex flex-1 flex-col-reverse gap-1.5 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-label={`Messages with ${participant.username}`}>
      {typing && (
        <p className="bg-hover text-muted self-start rounded-3xl px-3 py-2 text-sm" role="status">
          {participant.username} is typing…
        </p>
      )}
      {items.map((m) => {
        const mine = m.sender.id === myId;
        return (
          <MessageBubble
            key={m.id}
            message={m}
            mine={mine}
            footnote={m === lastMine && isReadUpTo(m.id, conversation.peerLastReadId) ? "Seen" : undefined}
            onUnsend={mine && !m.status ? () => setUnsending(m) : undefined}
          />
        );
      })}
      {loading && (
        <div role="status" aria-label="Loading messages" className="flex flex-col gap-2">
          {Array.from({ length: items.length === 0 ? 6 : 2 }, (_, i) => (
            <Skeleton key={i} className={i % 2 ? "h-8 w-40 self-end rounded-3xl" : "h-8 w-52 rounded-3xl"} />
          ))}
        </div>
      )}
      {error && (
        <div role="alert" className="flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-muted text-sm">Couldn&apos;t load {items.length === 0 ? "messages" : "older messages"}.</p>
          <Button size="sm" variant="secondary" onClick={loadMore}>
            Try again
          </Button>
        </div>
      )}
      {/* Rendered first visually (top); loads the next, older page when scrolled into view. */}
      <div ref={sentinelRef} aria-hidden className="h-px shrink-0" />
      {/* The start of the conversation: who it's with, once there's nothing older to load. */}
      {done && (
        <div className="flex flex-col items-center gap-1 pb-8 text-center">
          <Avatar src={participant.avatar} username={participant.username} size="xl" />
          <p className="mt-2 text-xl font-semibold">{participant.fullName}</p>
          <p className="text-muted text-sm">{participant.username} · Instaclone</p>
          {items.length === 0 && <p className="text-muted mt-4 text-sm">Say hi to start the conversation.</p>}
        </div>
      )}
      <ActionMenu
        open={unsending !== null}
        onClose={() => setUnsending(null)}
        title="Unsend message?"
        actions={[{ label: "Unsend", tone: "danger", onSelect: () => unsending && void unsend(unsending) }]}
      />
    </div>
  );
}
