import { http } from "@/lib/api";
import type { UserSummary } from "@/types";

export const userService = {
  list: (limit: number) => http.get<UserSummary[]>("/api/users", { params: { limit } }),
  suggested: (limit: number) => http.get<UserSummary[]>("/api/users/suggested", { params: { limit } }),
  search: (q: string) => http.get<UserSummary[]>("/api/search", { params: { q } }),
  setFollowing: (username: string, follow: boolean) => http.post(`/api/users/${username}/follow`, { follow }),
};
