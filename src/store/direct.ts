import { create } from "zustand";
import { conversationService } from "@/services/conversation.service";
import type { ConversationPreview, ID, Message } from "@/types";

interface DirectState {
  conversations: ConversationPreview[] | null;
  error: boolean;
  load: () => Promise<void>;
  /** Reflect a sent/received message in the inbox preview. */
  applyMessage: (message: Message) => void;
  markRead: (conversationId: ID) => void;
}

/** Inbox state shared by the conversation list and the open chat. */
export const useDirectStore = create<DirectState>()((set, get) => ({
  conversations: null,
  error: false,
  load: async () => {
    set({ error: false });
    try {
      const conversations = await conversationService.list();
      set({ conversations });
    } catch {
      if (get().conversations === null) set({ error: true });
    }
  },
  applyMessage: (message) =>
    set((s) => {
      if (!s.conversations) return s;
      const updated = s.conversations.map((c) => (c.id === message.conversationId ? { ...c, lastMessage: message } : c));
      updated.sort((a, b) => Date.parse(b.lastMessage?.createdAt ?? "0") - Date.parse(a.lastMessage?.createdAt ?? "0"));
      return { conversations: updated };
    }),
  markRead: (conversationId) =>
    set((s) => ({
      conversations: s.conversations?.map((c) => (c.id === conversationId ? { ...c, unread: false } : c)) ?? null,
    })),
}));
