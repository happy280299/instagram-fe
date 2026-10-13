"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import { storyService } from "@/services/story.service";
import { useAuthStore } from "@/store/auth";
import type { ID, StoryTrayItem } from "@/types";

interface TrayResult {
  key: string;
  items: StoryTrayItem[] | null;
  error: string | null;
}

/** The story bar's users. Refetches when the viewer logs in or out, since the tray depends on who follows whom. */
export function useStoryTray() {
  // Wait for the persisted session so the request carries the Bearer token.
  const hydrated = useAuthStore((s) => s.hydrated);
  const viewerId = useAuthStore((s) => s.user?.id ?? "guest");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<TrayResult | null>(null);
  const key = `${viewerId}:${attempt}`;

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    storyService.tray().then(
      (items) => !cancelled && setResult({ key, items, error: null }),
      (err: unknown) => !cancelled && setResult({ key, items: null, error: getErrorMessage(err, "Couldn't load stories.") }),
    );
    return () => {
      cancelled = true;
    };
  }, [hydrated, key]);

  const current = result?.key === key ? result : null;

  const markUserSeen = useCallback((userId: ID) => {
    setResult((r) =>
      r?.items ? { ...r, items: r.items.map((i) => (i.user.id === userId ? { ...i, hasUnseen: false } : i)) } : r,
    );
  }, []);

  return {
    items: current?.items ?? null,
    error: current?.error ?? null,
    loading: current === null,
    retry: () => setAttempt((a) => a + 1),
    markUserSeen,
  };
}
