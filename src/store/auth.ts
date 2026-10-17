import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getErrorMessage, HttpError, setApiToken, setTokenRefresher, setUnauthorizedHandler } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { type Profile, userService } from "@/services/user.service";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import { queryClient, resetServerState } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { ID, Session, TokenPair, User } from "@/types";
import { toast } from "./ui";

interface AuthState {
  hydrated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** Who the user followed at login — the baseline baked into server counts. */
  baselineFollowing: ID[];
  following: Record<ID, boolean>;
  login: (session: Session) => void;
  /** `remote: false` only clears this tab (the server already ended the session). */
  logout: (options?: { remote?: boolean }) => void;
  /** Stores a refreshed token pair (also seen by other tabs through localStorage). */
  setTokens: (tokens: TokenPair) => void;
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
      refreshToken: null,
      baselineFollowing: [],
      following: {},
      login: ({ user, followingIds, accessToken = null, refreshToken = null }) => {
        setApiToken(accessToken);
        set({ user, accessToken, refreshToken, baselineFollowing: followingIds, following: Object.fromEntries(followingIds.map((id) => [id, true])) });
        resetServerState();
        if (accessToken) void get().refreshMe();
      },
      logout: ({ remote = true } = {}) => {
        const { refreshToken } = get();
        // Best effort: the local session ends either way.
        if (remote && refreshToken) authService.logout(refreshToken).catch(() => undefined);
        setApiToken(null);
        set({ user: null, accessToken: null, refreshToken: null, baselineFollowing: [], following: {} });
        resetServerState();
      },
      setTokens: ({ accessToken, refreshToken }) => {
        setApiToken(accessToken);
        set({ accessToken, refreshToken });
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
          const { isFollowing, followerCount } = await userService.setFollowing(username, next);
          // The server count already includes this follow, so make it the new baseline (followerDelta → 0).
          set((s) => ({
            following: { ...s.following, [userId]: isFollowing },
            baselineFollowing: isFollowing ? [...s.baselineFollowing.filter((id) => id !== userId), userId] : s.baselineFollowing.filter((id) => id !== userId),
          }));
          queryClient.setQueryData<Profile>(queryKeys.profile(username.toLowerCase()), (p) =>
            p && { ...p, isFollowing, user: { ...p.user, followers: followerCount } },
          );
          // Lists that changed: their followers and the viewer's following. Marked stale only, so an open list doesn't reshuffle.
          void queryClient.invalidateQueries({ queryKey: queryKeys.followers(username.toLowerCase()), refetchType: "none" });
          const me = get().user;
          if (me) void queryClient.invalidateQueries({ queryKey: queryKeys.following(me.username), refetchType: "none" });
          // The viewer's own "following" count.
          void get().refreshMe();
        } catch (err) {
          set((s) => ({ following: { ...s.following, [userId]: !next } }));
          toast(getErrorMessage(err, `Couldn't ${next ? "follow" : "unfollow"} ${username}. Try again.`));
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
      partialize: ({ user, accessToken, refreshToken, baselineFollowing, following }) => ({ user, accessToken, refreshToken, baselineFollowing, following }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        setApiToken(state?.accessToken ?? null);
        useAuthStore.setState({ hydrated: true });
        void useAuthStore.getState().refreshMe();
      },
    },
  ),
);

/** Tokens as persisted by this store; another tab may have written newer ones. */
function readStoredTokens(): TokenPair | null {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? "null");
    const state = typeof raw === "object" && raw !== null && "state" in raw ? raw.state : null;
    if (typeof state !== "object" || state === null) return null;
    const accessToken = "accessToken" in state ? state.accessToken : null;
    const refreshToken = "refreshToken" in state ? state.refreshToken : null;
    return typeof accessToken === "string" && typeof refreshToken === "string" ? { accessToken, refreshToken } : null;
  } catch {
    return null;
  }
}

/**
 * Gets a fresh access token after a 401. Refresh tokens rotate and reusing a spent one locks the
 * whole session, so: one tab at a time (Web Locks), and if another tab already rotated, adopt its
 * tokens instead of refreshing again. Null means the session is over; network errors throw.
 */
async function refreshSession(staleToken: string): Promise<string | null> {
  const run = async () => {
    const stored = readStoredTokens();
    if (stored && stored.accessToken !== staleToken) {
      useAuthStore.getState().setTokens(stored);
      return stored.accessToken;
    }
    const refreshToken = stored?.refreshToken ?? useAuthStore.getState().refreshToken;
    if (!refreshToken) return null;
    try {
      const tokens = await authService.refresh(refreshToken);
      useAuthStore.getState().setTokens(tokens);
      return tokens.accessToken;
    } catch (err) {
      // Rejected (expired, revoked, reused): the session is over. Anything else: try again later.
      if (err instanceof HttpError && err.status === 401) return null;
      throw err;
    }
  };
  return typeof navigator !== "undefined" && navigator.locks ? navigator.locks.request("instaclone-auth-refresh", run) : run();
}

setTokenRefresher(refreshSession);

// Refresh failed too: drop the session so the app falls back to /login.
setUnauthorizedHandler(() => {
  useAuthStore.getState().logout({ remote: false });
  toast("Your session has expired. Please log in again.");
});
