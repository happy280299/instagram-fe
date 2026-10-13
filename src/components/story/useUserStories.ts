"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import { storyService } from "@/services/story.service";
import type { ID, UserStories } from "@/types";

interface Result {
  key: string;
  data: UserStories | null;
  error: string | null;
}

/** Loads one user's active stories when their avatar is opened in the story viewer. */
export function useUserStories(userId: ID) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const key = `${userId}:${attempt}`;

  useEffect(() => {
    let cancelled = false;
    storyService.byUser(userId).then(
      (data) => !cancelled && setResult({ key, data, error: null }),
      (err: unknown) => !cancelled && setResult({ key, data: null, error: getErrorMessage(err, "Couldn't load this story.") }),
    );
    return () => {
      cancelled = true;
    };
  }, [userId, key]);

  const current = result?.key === key ? result : null;
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    retry: () => setAttempt((a) => a + 1),
  };
}
