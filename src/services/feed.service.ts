import type { AxiosResponse } from "axios";
import { client } from "@/lib/api";
import type { ISODate, Paginated, PostWithAuthor } from "@/types";

/** Post as the backend's GET /api/feed returns it. */
export interface BackendFeedPost {
  id: number;
  caption: string;
  location: string | null;
  createdAt: ISODate;
  author: {
    id: number;
    username: string;
    name: string;
    avatarUrl: string;
    isVerified: boolean;
    isFollowing: boolean;
    isMe: boolean;
  };
  media: { id: number; url: string; type: "IMAGE" | "VIDEO"; width: number | null; height: number | null; thumbnailUrl: string | null }[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
  likedBy: { id: number; username: string; avatarUrl: string } | null;
  previewComments: { id: number; content: string; createdAt: ISODate; author: { id: number; username: string } }[];
}

export interface BackendFeedMeta {
  limit: number;
  nextCursor: number | null;
  hasMore: boolean;
}

/** A feed post plus the viewer-specific flags the stores need. */
export interface FeedPost extends PostWithAuthor {
  viewer: { liked: boolean; saved: boolean; followsAuthor: boolean };
}

export function toFeedPost(p: BackendFeedPost): FeedPost {
  const authorId = String(p.author.id);
  return {
    id: String(p.id),
    authorId,
    author: {
      id: authorId,
      username: p.author.username,
      fullName: p.author.name,
      avatar: p.author.avatarUrl || `https://i.pravatar.cc/150?u=${p.author.username}`,
      isVerified: p.author.isVerified,
    },
    media: p.media.map((m) => ({
      id: String(m.id),
      url: m.url,
      width: m.width ?? 1080,
      height: m.height ?? 1080,
      alt: `${m.type === "VIDEO" ? "Video" : "Photo"} by ${p.author.username}`,
      type: m.type === "VIDEO" ? "video" : "image",
      poster: m.thumbnailUrl ?? undefined,
    })),
    caption: p.caption,
    location: p.location,
    // PostActions adds the viewer's own like on top, so the server count must exclude it.
    likes: p.likeCount - (p.isLiked ? 1 : 0),
    commentsCount: p.commentCount,
    taggedUserIds: [],
    createdAt: p.createdAt,
    previewComments: p.previewComments.map((c) => ({
      id: String(c.id),
      text: c.content,
      author: { id: String(c.author.id), username: c.author.username },
    })),
    viewer: { liked: p.isLiked, saved: p.isSaved, followsAuthor: p.author.isFollowing },
  };
}

/** Maps a page of feed-shaped posts (GET /api/feed, GET /api/posts/users/:id) to `Paginated`. */
export function toFeedPage({ data, meta }: AxiosResponse<BackendFeedPost[]>): Paginated<FeedPost> {
  const { nextCursor } = (meta ?? {}) as Partial<BackendFeedMeta>;
  return { items: data.map(toFeedPost), nextCursor: nextCursor == null ? null : String(nextCursor) };
}

export const feedService = {
  list: (params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendFeedPost[]>("/api/feed", { params }).then(toFeedPage),
};
