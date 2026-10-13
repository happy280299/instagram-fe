"use client";

import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Spinner } from "@/components/ui/Spinner";
import { conversationService } from "@/services/conversation.service";
import { useAuthStore } from "@/store/auth";
import { useDirectStore } from "@/store/direct";
import { toast } from "@/store/ui";
import type { ConversationDetail, Message } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";

type LocalMessage = Message & { pending?: boolean; failed?: boolean };

export function ChatPane({ conversationId }: { conversationId: string }) {
  const me = useAuthStore((s) => s.user);
  const applyMessage = useDirectStore((s) => s.applyMessage);
  const markRead = useDirectStore((s) => s.markRead);
  const [convo, setConvo] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    conversationService.get(conversationId)
      .then((c) => {
        if (cancelled) return;
        setConvo(c);
        setMessages(c.messages);
        setStatus("ready");
        markRead(conversationId);
      })
      .catch(() => !cancelled && setStatus("missing"));
    return () => {
      cancelled = true;
    };
  }, [conversationId, me, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send(text: string) {
    if (!me) return;
    const temp: LocalMessage = { id: `tmp-${Date.now()}`, conversationId, senderId: me.id, text, createdAt: new Date().toISOString(), pending: true };
    setMessages((m) => [...m, temp]);
    applyMessage(temp);
    try {
      const saved = await conversationService.sendMessage(conversationId, text);
      setMessages((m) => m.map((x) => (x.id === temp.id ? saved : x)));
    } catch {
      setMessages((m) => m.map((x) => (x.id === temp.id ? { ...x, pending: false, failed: true } : x)));
      toast("Message failed to send");
    }
  }

  if (status === "loading") return <div className="flex flex-1 items-center justify-center"><Spinner size="lg" /></div>;
  if (status === "missing" || !convo) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-xl font-bold">Conversation not found</p>
        <Link href="/direct"><Button variant="secondary">Back to inbox</Button></Link>
      </div>
    );
  }

  const { participant } = convo;
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="border-separator flex items-center gap-3 border-b px-4 py-3">
        <Link href="/direct" aria-label="Back to inbox" className="md:hidden"><ArrowLeft aria-hidden className="size-6" /></Link>
        <Link href={`/${participant.username}`} className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar src={participant.avatar} username={participant.username} size="md" />
          <span className="min-w-0">
            <span className="block truncate font-semibold">{participant.fullName}</span>
            <span className="text-muted block truncate text-xs">{participant.username}</span>
          </span>
        </Link>
        <IconButton label="Conversation details" onClick={() => toast("Details aren't available in this demo")}><Info aria-hidden className="size-6" /></IconButton>
      </header>
      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-label={`Messages with ${participant.username}`}>
        <div className="flex flex-col items-center gap-1 pb-8 text-center">
          <Avatar src={participant.avatar} username={participant.username} size="xl" />
          <p className="mt-2 text-xl font-semibold">{participant.fullName}</p>
          <p className="text-muted text-sm">{participant.username} · Instaclone</p>
        </div>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} mine={m.senderId === me?.id} pending={m.pending} failed={m.failed} />
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageComposer onSend={(text) => void send(text)} />
    </div>
  );
}
