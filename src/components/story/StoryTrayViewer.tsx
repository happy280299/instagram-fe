"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { storyService } from "@/services/story.service";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import type { ID, StorySlide, StoryTrayItem, UserStories } from "@/types";
import { OwnStoryFooter } from "./OwnStoryFooter";
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
  const deleteSlide = useDeleteStory(data, next, onClose);
  const renderFooter = useCallback(
    (slide: StorySlide, hold: (held: boolean) => void) => <OwnStoryFooter slide={slide} hold={hold} onDelete={deleteSlide} />,
    [deleteSlide],
  );

  return (
    <StoryOverlay label={`Story by ${item.user.username}`} onClose={onClose}>
      {data ? (
        <StoryPlayer
          key={data.id}
          story={data}
          startSlide={data.startIndex}
          onNextStory={next}
          onPrevStory={prev}
          onSlideShown={handleSlideShown}
          renderFooter={data.isMe ? renderFooter : undefined}
        />
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

/**
 * Deletes one of your own slides, then moves on like Instagram: the next slide, the next user
 * when it was your last one, or closes when it was your only story.
 */
function useDeleteStory(story: UserStories | null, next: () => void, close: () => void) {
  const queryClient = useQueryClient();
  return useCallback(
    async (slide: StorySlide) => {
      if (!story) return;
      try {
        await storyService.remove(slide.id);
      } catch (err) {
        toast(getErrorMessage(err, "Couldn't delete your story. Try again."));
        return;
      }
      toast("Story deleted");
      const remaining = story.slides.filter((s) => s.id !== slide.id);
      queryClient.setQueryData<StoryTrayItem[]>(queryKeys.storyTray, (items) =>
        remaining.length === 0
          ? items?.filter((i) => i.user.id !== story.userId)
          : items?.map((i) => (i.user.id === story.userId ? { ...i, storyCount: remaining.length } : i)),
      );
      if (remaining.length === 0) return close();
      queryClient.setQueryData<UserStories>(queryKeys.userStories(story.userId), (cached) => cached && { ...cached, slides: remaining, startIndex: 0 });
      if (story.slides.at(-1)?.id === slide.id) next();
    },
    [story, next, close, queryClient],
  );
}

/** Reports each newly shown slide to the backend; guests can't mark stories as seen. */
function useMarkSeen(onUserSeen: (userId: ID) => void) {
  const isLoggedIn = useAuthStore((s) => s.accessToken !== null);
  const queryClient = useQueryClient();
  const seen = useRef(new Set<ID>());

  return useCallback(
    (story: UserStories, slide: StorySlide) => {
      if (!isLoggedIn || slide.isSeen || seen.current.has(slide.id)) return;
      seen.current.add(slide.id);
      storyService.markSeen(slide.id).then(
        () => {
          queryClient.setQueryData<UserStories>(queryKeys.userStories(story.userId), (cached) => cached && withSlideSeen(cached, slide.id));
          if (story.slides.every((s) => s.isSeen || seen.current.has(s.id))) onUserSeen(story.userId);
        },
        // Not something the user asked for, so no toast; the ring simply stays unseen and it's retried next time.
        () => seen.current.delete(slide.id),
      );
    },
    [isLoggedIn, onUserSeen, queryClient],
  );
}

/** Cached stories after a slide was seen, so reopening them starts at the next unseen one. */
function withSlideSeen(story: UserStories, slideId: ID): UserStories {
  const slides = story.slides.map((s) => (s.id === slideId ? { ...s, isSeen: true } : s));
  const firstUnseen = slides.findIndex((s) => !s.isSeen);
  return { ...story, slides, startIndex: firstUnseen === -1 ? 0 : firstUnseen };
}
