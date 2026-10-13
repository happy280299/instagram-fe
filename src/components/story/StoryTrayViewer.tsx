"use client";

import { useCallback, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { storyService } from "@/services/story.service";
import { useAuthStore } from "@/store/auth";
import type { ID, StorySlide, StoryTrayItem, UserStories } from "@/types";
import { STORY_FRAME_CLASS, StoryOverlay } from "./StoryOverlay";
import { StoryNavButtons } from "./StoryNavButtons";
import { StoryPlayer } from "./StoryPlayer";
import { useUserStories } from "./useUserStories";

interface StoryTrayViewerProps {
  tray: StoryTrayItem[];
  startIndex: number;
  onClose: () => void;
  /** Called when the viewer has now seen every story of a user. */
  onUserSeen: (userId: ID) => void;
}

/** Opens the story bar's users one by one, loading each user's stories from the backend. */
export function StoryTrayViewer({ tray, startIndex, onClose, onUserSeen }: StoryTrayViewerProps) {
  const [userIdx, setUserIdx] = useState(startIndex);
  const item = tray[userIdx];
  const { data, error, retry } = useUserStories(item.user.id);
  const markSeen = useMarkSeen(onUserSeen);

  const next = useCallback(() => {
    if (userIdx < tray.length - 1) setUserIdx(userIdx + 1);
    else onClose();
  }, [userIdx, tray.length, onClose]);

  const prev = useCallback(() => {
    if (userIdx > 0) setUserIdx(userIdx - 1);
  }, [userIdx]);

  const handleSlideShown = useCallback((slide: StorySlide) => data && markSeen(data, slide), [data, markSeen]);

  return (
    <StoryOverlay label={`Story by ${item.user.username}`} onClose={onClose}>
      {data ? (
        <StoryPlayer key={data.id} story={data} startSlide={data.startIndex} onNextStory={next} onPrevStory={prev} onSlideShown={handleSlideShown} />
      ) : (
        <>
          <div className={STORY_FRAME_CLASS} aria-busy={!error}>
            {!error && <span aria-hidden className="bg-on-media/10 absolute inset-0 animate-pulse" />}
            <div className="text-on-media absolute inset-x-0 top-0 flex items-center gap-2 p-3 pt-6">
              <Avatar src={item.user.avatar} username={item.user.username} size="sm" />
              <span className="text-sm font-semibold">{item.user.username}</span>
            </div>
            {error ? (
              <div role="alert" className="text-on-media absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm">{error}</p>
                <Button size="sm" variant="secondary" onClick={retry}>
                  Try again
                </Button>
              </div>
            ) : (
              <span role="status" className="sr-only">
                Loading story
              </span>
            )}
          </div>
          <StoryNavButtons onPrev={prev} onNext={next} />
        </>
      )}
    </StoryOverlay>
  );
}

/** Reports each newly shown slide to the backend; guests can't mark stories as seen. */
function useMarkSeen(onUserSeen: (userId: ID) => void) {
  const isLoggedIn = useAuthStore((s) => s.accessToken !== null);
  const seen = useRef(new Set<ID>());

  return useCallback(
    (story: UserStories, slide: StorySlide) => {
      if (!isLoggedIn || slide.isSeen || seen.current.has(slide.id)) return;
      seen.current.add(slide.id);
      storyService.markSeen(slide.id).then(
        () => {
          if (story.slides.every((s) => s.isSeen || seen.current.has(s.id))) onUserSeen(story.userId);
        },
        // Not something the user asked for, so no toast; the ring simply stays unseen and it's retried next time.
        () => seen.current.delete(slide.id),
      );
    },
    [isLoggedIn, onUserSeen],
  );
}
