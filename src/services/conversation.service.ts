import { http } from "@/lib/api";
import type { ConversationDetail, ConversationPreview, ID, Message } from "@/types";

export const conversationService = {
  list: () => http.get<ConversationPreview[]>("/api/conversations"),
  get: (conversationId: ID) => http.get<ConversationDetail>(`/api/conversations/${conversationId}`),
  sendMessage: (conversationId: ID, text: string) => http.post<Message>(`/api/conversations/${conversationId}/messages`, { text }),
};
