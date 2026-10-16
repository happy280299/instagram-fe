"use client";

import { useCallback, useEffect, useRef } from "react";
import { emitRealtime, REALTIME_CLIENT_EVENTS } from "@/lib/realtime";
import type { ID } from "@/types";

/** Stop saying "typing" after this long without a keystroke, as the backend suggests (~3s). */
const IDLE_MS = 3000;

/**
 * Tells the other member when the viewer starts and stops typing. Call `onInput` on every
 * keystroke and `stop` when the message is sent; leaving the screen stops it too.
 */
export function useTypingEmitter(conversationId: ID) {
  const typing = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const send = useCallback(
    (isTyping: boolean) => {
      if (typing.current === isTyping) return;
      typing.current = isTyping;
      // The backend expects the numeric id.
      emitRealtime(REALTIME_CLIENT_EVENTS.conversationTyping, { conversationId: Number(conversationId), isTyping });
    },
    [conversationId],
  );

  const stop = useCallback(() => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = null;
    send(false);
  }, [send]);

  const onInput = useCallback(() => {
    send(true);
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(stop, IDLE_MS);
  }, [send, stop]);

  useEffect(() => stop, [stop]);

  return { onInput, stop };
}
