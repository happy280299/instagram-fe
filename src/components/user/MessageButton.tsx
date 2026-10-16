"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { conversationService } from "@/services/conversation.service";
import { toast } from "@/store/ui";

/** Opens (or starts) the 1-1 chat with `username` (POST /api/conversations) and goes to it. */
export function MessageButton({ username }: { username: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [opening, setOpening] = useState(false);

  async function open() {
    setOpening(true);
    try {
      const conversation = await conversationService.open(username);
      // The chat screen needs exactly this; skip its first request.
      queryClient.setQueryData(queryKeys.conversation(conversation.id), conversation);
      router.push(`/direct/t/${conversation.id}`);
    } catch (err) {
      toast(getErrorMessage(err, `Couldn't open a chat with ${username}. Try again.`));
      setOpening(false);
    }
  }

  return (
    <Button size="sm" variant="secondary" onClick={() => void open()} loading={opening}>
      Message
    </Button>
  );
}
