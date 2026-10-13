import { client, http } from "@/lib/api";
import type { CommentThread, ID, ISODate, Paginated } from "@/types";

/** Comment as the backend's /api/posts/:postId/comments returns it. */
export interface BackendComment {
  id: number;
  content: string;
  createdAt: ISODate;
  author: { id: number; username: string; avatarUrl: string; isVerified: boolean };
  isMine: boolean;
}

function toComment(postId: ID, c: BackendComment): CommentThread {
  const authorId = String(c.author.id);
  return {
    id: String(c.id),
    postId,
    authorId,
    // The backend has no replies or comment likes yet.
    parentId: null,
    replies: [],
    likes: 0,
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
  };
}

export const commentService = {
  /** Oldest first, cursor-paginated. */
  list: (postId: ID, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendComment[]>(`/api/posts/${postId}/comments`, { params }).then(({ data, meta }): Paginated<CommentThread> => {
      const { nextCursor } = (meta ?? {}) as { nextCursor?: number | null };
      return { items: data.map((c) => toComment(postId, c)), nextCursor: nextCursor == null ? null : String(nextCursor) };
    }),
  create: (postId: ID, content: string) =>
    http.post<BackendComment>(`/api/posts/${postId}/comments`, { content }).then((c) => toComment(postId, c)),
  remove: (commentId: ID) => http.delete(`/api/comments/${commentId}`),
};
