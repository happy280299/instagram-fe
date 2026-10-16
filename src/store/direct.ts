import { create } from "zustand";
import type { ID } from "@/types";

/** Drop a "typing…" that never got its isTyping: false (the peer closed the tab, lost network…). */
const TYPING_TIMEOUT_MS = 6000;
const typingTimers = new Map<ID, ReturnType<typeof setTimeout>>();

interface DirectState {
  /** The conversation on screen; messages arriving there are marked read at once. */
  openConversationId: ID | null;
  setOpenConversation: (id: ID | null) => void;
  /** Conversations whose other member is typing right now. */
  typing: Record<ID, true>;
  setTyping: (conversationId: ID, isTyping: boolean) => void;
}

/** Live chat UI state shared by the inbox, the open chat and the socket handlers. Messages themselves live in the query cache. */
export const useDirectStore = create<DirectState>()((set, get) => ({
  openConversationId: null,
  setOpenConversation: (id) => set({ openConversationId: id }),
  typing: {},
  setTyping: (conversationId, isTyping) => {
    clearTimeout(typingTimers.get(conversationId));
    typingTimers.delete(conversationId);
    if (isTyping) typingTimers.set(conversationId, setTimeout(() => get().setTyping(conversationId, false), TYPING_TIMEOUT_MS));
    set((s) => {
      if (Boolean(s.typing[conversationId]) === isTyping) return s;
      const typing = { ...s.typing };
      if (isTyping) typing[conversationId] = true;
      else delete typing[conversationId];
      return { typing };
    });
  },
}));
