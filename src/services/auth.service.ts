import type { AxiosResponse } from "axios";
import { client, http, withMessage, type ApiResult } from "@/lib/api";
import type { AuthResponse, BackendProfile, BackendUser, ID, LoginBody, RegisterBody, Session, TokenPair, UpdateProfileBody, User } from "@/types";

/** Shown when a user has no avatar; the backend stores "" for them. */
export const placeholderAvatar = (userId: ID) => `https://i.pravatar.cc/300?u=${userId}`;

/** Whether `user.avatar` is a real photo rather than the placeholder. */
export const hasAvatar = (user: Pick<User, "id" | "avatar">) => user.avatar !== placeholderAvatar(user.id);

type PublicFields<T> = Omit<T, "email" | "role">;

/** Maps a backend user onto the app's User; counts are 0 unless the response includes them. */
export function toUser(user: PublicFields<BackendUser> | PublicFields<BackendProfile>): User {
  const id = String(user.id);
  const counts = "postCount" in user ? user : null;
  return {
    id,
    username: user.username,
    fullName: user.name,
    avatar: user.avatarUrl || placeholderAvatar(id),
    bio: user.bio,
    website: null,
    isVerified: user.isVerified,
    followers: counts?.followerCount ?? 0,
    following: counts?.followingCount ?? 0,
    postsCount: counts?.postCount ?? 0,
    highlights: [],
    ...("showActivityStatus" in user && typeof user.showActivityStatus === "boolean" ? { showActivityStatus: user.showActivityStatus } : {}),
  };
}

export interface AuthResult {
  session: Session;
  /** Backend success message ("Login success", "Register success"…), for the toast. */
  message: string | null;
}

function toAuthResult(response: AxiosResponse<AuthResponse>): AuthResult {
  const { data, message } = withMessage(response);
  return { session: { accessToken: data.accessToken, refreshToken: data.refreshToken, user: toUser(data.user), followingIds: [] }, message };
}

function toUserResult(response: AxiosResponse<BackendProfile>): ApiResult<User> {
  const { data, message } = withMessage(response);
  return { data: toUser(data), message };
}

export const authService = {
  login: (body: LoginBody) => client.post<AuthResponse>("/api/auth/login", body).then(toAuthResult),
  register: (body: RegisterBody) => client.post<AuthResponse>("/api/auth/register", body).then(toAuthResult),
  /** Trades a refresh token for a new pair (rotation: the old one is dead afterwards). */
  refresh: (refreshToken: string) => http.post<TokenPair>("/api/auth/refresh", { refreshToken }),
  /**
   * Changes the password. Every other device is logged out; this one gets a new token pair to store.
   * A wrong current password is a 400 (not 401), so it never triggers a token refresh.
   */
  changePassword: (body: { currentPassword: string; newPassword: string }) => client.patch<TokenPair>("/api/auth/password", body).then(withMessage),
  /** Ends this device's session on the server. */
  logout: (refreshToken: string) => http.post("/api/auth/logout", { refreshToken }),
  me: () => client.get<BackendProfile>("/api/auth/me").then((r) => toUser(r.data)),
  updateMe: (body: UpdateProfileBody) => client.patch<BackendProfile>("/api/auth/me", body).then(toUserResult),
};
