import { client, http } from "@/lib/api";
import type { CommentThread, ID, ISODate, Paginated } from "@/types";

/** Comment as GET /api/posts/:postId/comments and GET /api/comments/:id/replies return it. */
export interface BackendComment {
  id: number;
  content: string;
  createdAt: ISODate;
  /** null for a top-level comment; replies are one level deep. */
  parentId: number | null;
  author: { id: number; username: string; avatarUrl: string; isVerified: boolean };
  isMine: boolean;
  likeCount: number;
  isLiked: boolean;
  /** Top-level comments only. */
  replyCount: number;
}

/** A mapped comment plus the viewer's like, for the store (the count excludes it, like post likes). */
export interface MappedComment {
  comment: CommentThread;
  isLiked: boolean;
}

function toComment(postId: ID, c: BackendComment): MappedComment {
  const authorId = String(c.author.id);
  return {
    comment: {
      id: String(c.id),
      postId,
      authorId,
      parentId: c.parentId === null ? null : String(c.parentId),
      // Replies load on demand (GET /comments/:id/replies); `replyCount` says how many.
      replies: [],
      replyCount: c.replyCount,
      // CommentItem adds the viewer's own like on top, so the server count must exclude it.
      likes: c.likeCount - (c.isLiked ? 1 : 0),
      text: c.content,
      createdAt: c.createdAt,
      isMine: c.isMine,
      author: {
        id: authorId,
        username: c.author.username,
        fullName: c.author.username,
        avatar: c.author.avatarUrl || `https://i.pravatar.cc/150?u=${c.author.username}`,
        isVerified: c.author.isVerified,
      },
    },
    isLiked: c.isLiked,
  };
}

function toPage(postId: ID) {
  return ({ data, meta }: { data: BackendComment[]; meta?: unknown }): Paginated<MappedComment> => {
    const { nextCursor } = (meta ?? {}) as { nextCursor?: number | null };
    return { items: data.map((c) => toComment(postId, c)), nextCursor: nextCursor == null ? null : String(nextCursor) };
  };
}

export const commentService = {
  /** Top-level comments, oldest first, cursor-paginated. */
  list: (postId: ID, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendComment[]>(`/api/posts/${postId}/comments`, { params }).then(toPage(postId)),
  /** Replies to a top-level comment. */
  replies: (postId: ID, commentId: ID, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendComment[]>(`/api/comments/${commentId}/replies`, { params }).then(toPage(postId)),
  /** `parentId` makes it a reply; replying to a reply attaches to its top-level comment on the backend. */
  create: (postId: ID, content: string, parentId?: ID) =>
    http
      .post<BackendComment>(`/api/posts/${postId}/comments`, { content, ...(parentId ? { parentId: Number(parentId) } : {}) })
      .then((c) => toComment(postId, c).comment),
  remove: (commentId: ID) => http.delete(`/api/comments/${commentId}`),
  setLiked: (commentId: ID, liked: boolean) =>
    liked ? http.post(`/api/comments/${commentId}/like`) : http.delete(`/api/comments/${commentId}/like`),
};
