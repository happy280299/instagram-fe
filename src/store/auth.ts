import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { setApiToken, setUnauthorizedHandler } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import { resetServerState } from "@/lib/query-client";
import type { ID, Session, User } from "@/types";
import { toast } from "./ui";

interface AuthState {
  hydrated: boolean;
  user: User | null;
  accessToken: string | null;
  /** Who the user followed at login — the baseline baked into server counts. */
  baselineFollowing: ID[];
  following: Record<ID, boolean>;
  login: (session: Session) => void;
  logout: () => void;
  setUser: (user: User) => void;
  /** Re-reads the profile (counts, edits made elsewhere) from GET /auth/me. */
  refreshMe: () => Promise<void>;
  isFollowing: (userId: ID) => boolean;
  /** +1/-1/0 adjustment to apply to a server-provided follower count. */
  followerDelta: (userId: ID) => number;
  toggleFollow: (userId: ID, username: string) => Promise<void>;
  /** Records users the server says the viewer already follows. */
  syncFollowing: (userIds: ID[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,
      accessToken: null,
      baselineFollowing: [],
      following: {},
      login: ({ user, followingIds, accessToken = null }) => {
        setApiToken(accessToken);
        set({ user, accessToken, baselineFollowing: followingIds, following: Object.fromEntries(followingIds.map((id) => [id, true])) });
        resetServerState();
        if (accessToken) void get().refreshMe();
      },
      logout: () => {
        setApiToken(null);
        set({ user: null, accessToken: null, baselineFollowing: [], following: {} });
        resetServerState();
      },
      setUser: (user) => set({ user }),
      refreshMe: async () => {
        if (!get().accessToken) return;
        try {
          get().setUser(await authService.me());
        } catch {
          // A 401 already logs out via the unauthorized handler; otherwise keep the cached user.
        }
      },
      isFollowing: (userId) => get().following[userId] === true,
      followerDelta: (userId) => {
        const now = get().isFollowing(userId) ? 1 : 0;
        const before = get().baselineFollowing.includes(userId) ? 1 : 0;
        return now - before;
      },
      toggleFollow: async (userId, username) => {
        const next = !get().isFollowing(userId);
        set((s) => ({ following: { ...s.following, [userId]: next } }));
        try {
          await userService.setFollowing(username, next);
        } catch {
          set((s) => ({ following: { ...s.following, [userId]: !next } }));
          toast(`Couldn't ${next ? "follow" : "unfollow"} ${username}. Try again.`);
        }
      },
      syncFollowing: (userIds) =>
        set((s) => {
          const added = userIds.filter((id) => !s.following[id] && !s.baselineFollowing.includes(id));
          if (added.length === 0) return s;
          return {
            baselineFollowing: [...s.baselineFollowing, ...added],
            following: { ...s.following, ...Object.fromEntries(added.map((id) => [id, true])) },
          };
        }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ user, accessToken, baselineFollowing, following }) => ({ user, accessToken, baselineFollowing, following }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        setApiToken(state?.accessToken ?? null);
        useAuthStore.setState({ hydrated: true });
        void useAuthStore.getState().refreshMe();
      },
    },
  ),
);

// Expired or revoked token: drop the session so the app falls back to /login.
setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
  toast("Your session has expired. Please log in again.");
});
