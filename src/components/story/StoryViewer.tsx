"use client";

import { useCallback, useEffect, useState } from "react";
import { usePostStore } from "@/store/post";
import type { StoryWithUser } from "@/types";
import { StoryOverlay } from "./StoryOverlay";
import { StoryPlayer } from "./StoryPlayer";

interface StoryViewerProps {
  stories: StoryWithUser[];
  startIndex: number;
  onClose: () => void;
}

/** Plays stories that are already loaded (profile highlights). The story bar uses `StoryTrayViewer`. */
export function StoryViewer({ stories, startIndex, onClose }: StoryViewerProps) {
  const [storyIdx, setStoryIdx] = useState(startIndex);
  const markSeen = usePostStore((s) => s.markStorySeen);
  const story = stories[storyIdx];

  useEffect(() => {
    markSeen(story.id);
  }, [story.id, markSeen]);

  const next = useCallback(() => {
    if (storyIdx < stories.length - 1) setStoryIdx(storyIdx + 1);
    else onClose();
  }, [storyIdx, stories.length, onClose]);

  const prev = useCallback(() => {
    if (storyIdx > 0) setStoryIdx(storyIdx - 1);
  }, [storyIdx]);

  return (
    <StoryOverlay label={`Story by ${story.user.username}`} onClose={onClose}>
      <StoryPlayer key={story.id} story={story} onNextStory={next} onPrevStory={prev} />
    </StoryOverlay>
  );
}
