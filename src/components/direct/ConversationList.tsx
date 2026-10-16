"use client";

import { MessageCircle, SquarePen } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { queryKeys } from "@/lib/query-keys";
import { conversationService } from "@/services/conversation.service";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import type { ChatConversation } from "@/types";
import { ConversationItem } from "./ConversationItem";

const PAGE_SIZE = 20;

/** Inbox (GET /api/conversations): conversations with messages, most recent first. Kept live by the socket. */
export function ConversationList() {
  const pathname = usePathname();
  const me = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const { items, loading, error, done, sentinelRef, loadMore } = usePaginatedQuery<ChatConversation>(
    queryKeys.conversations,
    conversationService.list,
    { limit: PAGE_SIZE, enabled: hydrated && me !== null },
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-6 pb-3 md:px-6 md:pt-9">
        <h1 className="truncate text-xl font-bold">{me?.username ?? "Messages"}</h1>
        <IconButton label="New message" onClick={() => toast("Start a chat with the Message button on someone's profile")}>
          <SquarePen aria-hidden className="size-6" />
        </IconButton>
      </div>
      <h2 className="px-4 pb-2 font-bold md:px-6">Messages</h2>
      <div className="flex-1 overflow-y-auto" aria-busy={loading}>
        {items.length > 0 && (
          <ul aria-label="Conversations">
            {items.map((c) => (
              <ConversationItem key={c.id} conversation={c} active={pathname === `/direct/t/${c.id}`} viewerId={me?.id} />
            ))}
          </ul>
        )}
        {loading && (
          <div role="status" aria-label="Loading conversations">
            {Array.from({ length: items.length === 0 ? 7 : 2 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 md:px-6" aria-hidden>
                <Skeleton rounded="full" className="size-avatar-lg" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2.5 w-44" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div role="alert" className="flex flex-col items-center gap-2 py-10">
            <p className="text-muted text-sm">Couldn&apos;t load {items.length === 0 ? "messages" : "more conversations"}.</p>
            <Button size="sm" variant="secondary" onClick={loadMore}>
              Try again
            </Button>
          </div>
        )}
        {done && items.length === 0 && (
          <EmptyState icon={MessageCircle} title="No messages yet" description="Open someone's profile and tap Message to start a conversation." />
        )}
        <div ref={sentinelRef} aria-hidden className="h-px" />
      </div>
    </div>
  );
}
