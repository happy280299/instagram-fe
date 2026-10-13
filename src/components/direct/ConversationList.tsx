"use client";

import { MessageCircle, SquarePen } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/auth";
import { useDirectStore } from "@/store/direct";
import { toast } from "@/store/ui";
import { ConversationItem } from "./ConversationItem";

export function ConversationList() {
  const pathname = usePathname();
  const me = useAuthStore((s) => s.user);
  const { conversations, error, load } = useDirectStore();

  useEffect(() => {
    if (me) void load();
  }, [me, load]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-6 pb-3 md:px-6 md:pt-9">
        <h1 className="truncate text-xl font-bold">{me?.username ?? "Messages"}</h1>
        <IconButton label="New message" onClick={() => toast("Start a chat from someone's profile")}>
          <SquarePen aria-hidden className="size-6" />
        </IconButton>
      </div>
      <h2 className="px-4 pb-2 font-bold md:px-6">Messages</h2>
      <div className="flex-1 overflow-y-auto" aria-busy={conversations === null}>
        {error && (
          <div className="flex flex-col items-center gap-2 py-10">
            <p className="text-muted text-sm">Couldn&apos;t load messages.</p>
            <Button size="sm" variant="secondary" onClick={() => void load()}>Try again</Button>
          </div>
        )}
        {!error && conversations === null && (
          <div role="status" aria-label="Loading conversations">
            {Array.from({ length: 7 }, (_, i) => (
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
        {conversations?.length === 0 && (
          <EmptyState icon={MessageCircle} title="No messages yet" description="Send private photos and messages to a friend." />
        )}
        {conversations && conversations.length > 0 && (
          <ul aria-label="Conversations">
            {conversations.map((c) => (
              <ConversationItem key={c.id} conversation={c} active={pathname === `/direct/t/${c.id}`} viewerId={me?.id} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
