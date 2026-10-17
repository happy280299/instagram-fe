import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { UI_STORAGE_KEY } from "@/lib/constants";
import type { ID, UserSummary } from "@/types";

export type Theme = "light" | "dark" | "system";
export type Panel = "search" | "notifications" | null;

export interface Toast {
  id: number;
  message: string;
}

export interface ShareTarget {
  path: string;
  title: string;
}

interface UIState {
  theme: Theme;
  panel: Panel;
  createOpen: boolean;
  shareTarget: ShareTarget | null;
  commentsPostId: ID | null;
  /** Comments whose replies are shown (opened, or a reply was just posted). Not persisted. */
  expandedReplies: Record<ID, true>;
  setRepliesExpanded: (commentId: ID, expanded: boolean) => void;
  toasts: Toast[];
  recentSearches: UserSummary[];
  /** Reels start muted so browsers allow autoplay. */
  reelsMuted: boolean;
  setReelsMuted: (muted: boolean) => void;
  setTheme: (theme: Theme) => void;
  togglePanel: (panel: Exclude<Panel, null>) => void;
  closePanel: () => void;
  setCreateOpen: (open: boolean) => void;
  openShare: (target: ShareTarget) => void;
  closeShare: () => void;
  openComments: (postId: ID) => void;
  closeComments: () => void;
  toast: (message: string) => void;
  dismissToast: (id: number) => void;
  addRecentSearch: (user: UserSummary) => void;
  removeRecentSearch: (id: ID) => void;
  clearRecentSearches: () => void;
}

let toastId = 0;

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",
      panel: null,
      createOpen: false,
      shareTarget: null,
      commentsPostId: null,
      toasts: [],
      recentSearches: [],
      reelsMuted: true,
      setReelsMuted: (reelsMuted) => set({ reelsMuted }),
      setTheme: (theme) => set({ theme }),
      togglePanel: (panel) => set((s) => ({ panel: s.panel === panel ? null : panel })),
      closePanel: () => set({ panel: null }),
      setCreateOpen: (createOpen) => set({ createOpen }),
      openShare: (shareTarget) => set({ shareTarget }),
      closeShare: () => set({ shareTarget: null }),
      expandedReplies: {},
      setRepliesExpanded: (commentId, expanded) =>
        set((s) => {
          const expandedReplies = { ...s.expandedReplies };
          if (expanded) expandedReplies[commentId] = true;
          else delete expandedReplies[commentId];
          return { expandedReplies };
        }),
      openComments: (commentsPostId) => set({ commentsPostId }),
      closeComments: () => set({ commentsPostId: null }),
      toast: (message) => {
        toastId += 1;
        const id = toastId;
        set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      addRecentSearch: (user) =>
        set((s) => ({ recentSearches: [user, ...s.recentSearches.filter((u) => u.id !== user.id)].slice(0, 10) })),
      removeRecentSearch: (id) => set((s) => ({ recentSearches: s.recentSearches.filter((u) => u.id !== id) })),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: UI_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme, recentSearches: s.recentSearches }),
      skipHydration: true,
    },
  ),
);

export const toast = (message: string) => useUIStore.getState().toast(message);
