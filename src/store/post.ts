import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getErrorMessage } from "@/lib/api";
import { postService } from "@/services/post.service";
import { POSTS_STORAGE_KEY } from "@/lib/constants";
import { updateCachedPost } from "@/lib/post-cache";
import type { ID } from "@/types";
import { toast } from "./ui";

interface PostState {
  liked: Record<ID, boolean>;
  /** Saved post ids, most recently saved first. */
  saved: ID[];
  likedComments: Record<ID, boolean>;
  seenStories: Record<ID, true>;
  isLiked: (postId: ID) => boolean;
  isSaved: (postId: ID) => boolean;
  setLike: (postId: ID, liked: boolean) => Promise<void>;
  toggleLike: (postId: ID) => Promise<void>;
  toggleSave: (postId: ID) => Promise<void>;
  toggleCommentLike: (commentId: ID) => void;
  markStorySeen: (storyId: ID) => void;
  /** Adopts the server's liked/saved flags for posts just loaded from the backend. */
  syncViewerState: (posts: { id: ID; liked: boolean; saved: boolean }[]) => void;
}

export const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      liked: {},
      saved: [],
      likedComments: {},
      seenStories: {},
      isLiked: (postId) => get().liked[postId] === true,
      isSaved: (postId) => get().saved.includes(postId),
      setLike: async (postId, liked) => {
        if (get().isLiked(postId) === liked) return;
        set((s) => ({ liked: { ...s.liked, [postId]: liked } }));
        try {
          const { isLiked, likeCount } = await postService.setLiked(postId, liked);
          // Cached counts exclude the viewer's own like (PostActions adds it); this also picks up others' likes since load.
          updateCachedPost(postId, (post) => ({ ...post, likes: Math.max(likeCount - (isLiked ? 1 : 0), 0) }));
        } catch (err) {
          set((s) => ({ liked: { ...s.liked, [postId]: !liked } }));
          toast(getErrorMessage(err, "Couldn't update like. Try again."));
        }
      },
      toggleLike: (postId) => get().setLike(postId, !get().isLiked(postId)),
      toggleSave: async (postId) => {
        const next = !get().isSaved(postId);
        const apply = (save: boolean) =>
          set((s) => ({ saved: save ? [postId, ...s.saved.filter((id) => id !== postId)] : s.saved.filter((id) => id !== postId) }));
        apply(next);
        try {
          await postService.setSaved(postId, next);
          toast(next ? "Saved to your collection" : "Removed from saved");
        } catch {
          apply(!next);
          toast("Couldn't update saved posts. Try again.");
        }
      },
      toggleCommentLike: (commentId) =>
        set((s) => ({ likedComments: { ...s.likedComments, [commentId]: !s.likedComments[commentId] } })),
      markStorySeen: (storyId) => set((s) => (s.seenStories[storyId] ? s : { seenStories: { ...s.seenStories, [storyId]: true } })),
      syncViewerState: (posts) =>
        set((s) => {
          const savedNow = new Set(posts.filter((p) => p.saved).map((p) => p.id));
          const loaded = new Set(posts.map((p) => p.id));
          const keep = s.saved.filter((id) => !loaded.has(id) || savedNow.has(id));
          return {
            liked: { ...s.liked, ...Object.fromEntries(posts.map((p) => [p.id, p.liked])) },
            saved: [...[...savedNow].filter((id) => !keep.includes(id)), ...keep],
          };
        }),
    }),
    {
      name: POSTS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ liked, saved, likedComments, seenStories }) => ({ liked, saved, likedComments, seenStories }),
      skipHydration: true,
    },
  ),
);
