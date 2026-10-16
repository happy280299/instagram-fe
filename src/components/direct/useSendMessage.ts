"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getErrorMessage } from "@/lib/api";
import { conversationService } from "@/services/conversation.service";
import { uploadService } from "@/services/upload.service";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import type { ChatMessage, ID } from "@/types";
import { addMessage, bumpConversation, updateMessage } from "./chat-cache";

export type Outgoing = { text: string } | { file: File; kind: "image" | "video" };

/**
 * Sends a message optimistically: it shows at once as "sending", media is uploaded first, and the
 * server's copy replaces it (the socket may deliver that copy first; the cache dedupes by id).
 */
export function useSendMessage(conversationId: ID) {
  const queryClient = useQueryClient();
  const me = useAuthStore((s) => s.user);

  return useCallback(
    async (outgoing: Outgoing) => {
      if (!me) return;
      const tempId = `tmp-${Date.now()}`;
      const localUrl = "file" in outgoing ? URL.createObjectURL(outgoing.file) : null;
      const temp: ChatMessage = {
        id: tempId,
        conversationId,
        sender: { id: me.id, username: me.username, avatar: me.avatar },
        text: "text" in outgoing ? outgoing.text : null,
        media: localUrl && "kind" in outgoing ? { url: localUrl, type: outgoing.kind, width: null, height: null } : null,
        createdAt: new Date().toISOString(),
        status: "sending",
      };
      addMessage(queryClient, temp);
      try {
        const body = "file" in outgoing ? { mediaUrl: (await uploadService.media(outgoing.file, outgoing.file.name)).url } : { content: outgoing.text };
        const saved = await conversationService.send(conversationId, body);
        addMessage(queryClient, saved, { replaceId: tempId });
        bumpConversation(queryClient, saved, 0);
        if (localUrl) URL.revokeObjectURL(localUrl);
      } catch (err) {
        updateMessage(queryClient, conversationId, tempId, { status: "failed" });
        toast(getErrorMessage(err, "Message failed to send."));
      }
    },
    [conversationId, me, queryClient],
  );
}
