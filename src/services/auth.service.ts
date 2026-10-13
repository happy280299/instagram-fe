import type { AxiosResponse } from "axios";
import { client, withMessage, type ApiResult } from "@/lib/api";
import type { AuthResponse, BackendProfile, BackendUser, LoginBody, RegisterBody, Session, UpdateProfileBody, User } from "@/types";

/** Maps a backend user onto the app's User; counts are 0 until /auth/me provides them. */
export function toUser(user: BackendUser | BackendProfile): User {
  const id = String(user.id);
  const counts = "postCount" in user ? user : null;
  return {
    id,
    username: user.username,
    fullName: user.name,
    avatar: user.avatarUrl || `https://i.pravatar.cc/300?u=${id}`,
    bio: user.bio,
    website: null,
    isVerified: user.isVerified,
    followers: counts?.followerCount ?? 0,
    following: counts?.followingCount ?? 0,
    postsCount: counts?.postCount ?? 0,
    highlights: [],
  };
}

export interface AuthResult {
  session: Session;
  /** Backend success message ("Login success", "Register success"…), for the toast. */
  message: string | null;
}

function toAuthResult(response: AxiosResponse<AuthResponse>): AuthResult {
  const { data, message } = withMessage(response);
  return { session: { accessToken: data.accessToken, user: toUser(data.user), followingIds: [] }, message };
}

function toUserResult(response: AxiosResponse<BackendProfile>): ApiResult<User> {
  const { data, message } = withMessage(response);
  return { data: toUser(data), message };
}

export const authService = {
  login: (body: LoginBody) => client.post<AuthResponse>("/api/auth/login", body).then(toAuthResult),
  register: (body: RegisterBody) => client.post<AuthResponse>("/api/auth/register", body).then(toAuthResult),
  me: () => client.get<BackendProfile>("/api/auth/me").then((r) => toUser(r.data)),
  updateMe: (body: UpdateProfileBody) => client.patch<BackendProfile>("/api/auth/me", body).then(toUserResult),
};
