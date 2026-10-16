import type { AxiosResponse } from "axios";
import { client, http } from "@/lib/api";
import type { Activity, ActivityType, ISODate, Paginated } from "@/types";

/** Item of GET /api/notifications. */
interface BackendNotification {
  id: number;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  createdAt: ISODate;
  isRead: boolean;
  actors: { id: number; username: string; avatarUrl: string; isVerified: boolean; isFollowing: boolean }[];
  actorCount: number;
  post: { id: number; thumbnailUrl: string | null } | null;
  comment: { id: number; content: string } | null;
}

const TYPES: Record<BackendNotification["type"], ActivityType> = { LIKE: "like", COMMENT: "comment", FOLLOW: "follow" };

function toActivity(n: BackendNotification): Activity {
  return {
    id: String(n.id),
    type: TYPES[n.type],
    createdAt: n.createdAt,
    isRead: n.isRead,
    actors: n.actors.map((a) => ({
      id: String(a.id),
      username: a.username,
      avatar: a.avatarUrl || `https://i.pravatar.cc/150?u=${a.username}`,
      isVerified: a.isVerified,
      isFollowing: a.isFollowing,
    })),
    actorCount: n.actorCount,
    post: n.post ? { id: String(n.post.id), thumbnail: n.post.thumbnailUrl } : null,
    commentText: n.comment?.content ?? null,
  };
}

function toActivityPage({ data, meta }: AxiosResponse<BackendNotification[]>): Paginated<Activity> {
  const { nextCursor } = (meta ?? {}) as { nextCursor?: number | null };
  // Types this client doesn't know yet (added later on the backend) are skipped rather than shown wrong.
  return { items: data.filter((n) => n.type in TYPES).map(toActivity), nextCursor: nextCursor == null ? null : String(nextCursor) };
}

/** Socket payloads aren't typed by axios generics; check the fields the mapper relies on. */
function isBackendNotification(raw: unknown): raw is BackendNotification {
  return (
    typeof raw === "object" &&
    raw !== null &&
    "id" in raw &&
    typeof raw.id === "number" &&
    "type" in raw &&
    typeof raw.type === "string" &&
    raw.type in TYPES &&
    "actors" in raw &&
    Array.isArray(raw.actors) &&
    "createdAt" in raw &&
    typeof raw.createdAt === "string"
  );
}

export const notificationService = {
  /** Maps a `notification:new` socket payload (same shape as a list item); null if it isn't one we can show. */
  fromEvent: (raw: unknown): Activity | null => (isBackendNotification(raw) ? toActivity(raw) : null),
  /** Reads the `notification:unread-count` payload. */
  countFromEvent: (raw: unknown): number | null =>
    typeof raw === "object" && raw !== null && "count" in raw && typeof raw.count === "number" ? raw.count : null,
  /** The viewer's activity, grouped and newest first. */
  list: (params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendNotification[]>("/api/notifications", { params }).then(toActivityPage),
  unreadCount: () => http.get<{ count: number }>("/api/notifications/unread-count").then((r) => r.count),
  markAllRead: () => http.post<{ updated: number }>("/api/notifications/read"),
};
