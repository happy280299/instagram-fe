import { mocks } from "@/mocks";
import type { ID, Paginated, User, UserSummary } from "@/types";

/**
 * In-memory database seeded from the JSON fixtures. Timestamps are shifted so
 * the newest fixture lands "just now" relative to server start. Mutations
 * (comments, messages, new posts) live for the lifetime of the server process.
 */
const offset = Date.now() - Date.parse(mocks.meta.anchor) - 60_000;
const shift = (iso: string) => new Date(Date.parse(iso) + offset).toISOString();

function withShiftedDates<T extends { createdAt: string }>(items: T[]): T[] {
  return items.map((item) => ({ ...item, createdAt: shift(item.createdAt) }));
}

export const db = {
  users: structuredClone(mocks.users),
  follows: structuredClone(mocks.follows),
  posts: withShiftedDates(mocks.posts),
  comments: withShiftedDates(mocks.comments),
  stories: mocks.stories.map((s) => ({ ...s, slides: withShiftedDates(s.slides) })),
  reels: withShiftedDates(mocks.reels),
  conversations: mocks.conversations.map((c) => ({ ...c, messages: withShiftedDates(c.messages) })),
  notifications: withShiftedDates(mocks.notifications),
  currentUserId: mocks.meta.currentUserId,
};

const usersById = new Map<ID, User>(db.users.map((u) => [u.id, u]));

export function findUser(id: ID): User | undefined {
  return usersById.get(id);
}

export function registerUser(user: User) {
  usersById.set(user.id, user);
}

export function toSummary(user: User): UserSummary {
  const { id, username, fullName, avatar, isVerified } = user;
  return { id, username, fullName, avatar, isVerified };
}

export function summaryOf(id: ID): UserSummary {
  const user = findUser(id);
  if (!user) throw new Error(`Unknown user ${id}`);
  return toSummary(user);
}

export const byNewest = <T extends { createdAt: string }>(a: T, b: T) =>
  Date.parse(b.createdAt) - Date.parse(a.createdAt);

/** Cursor pagination: the cursor is the id of the last item already returned. */
export function paginate<T extends { id: ID }>(
  items: T[],
  cursor: string | null,
  limit: number,
): Paginated<T> {
  const start = cursor ? items.findIndex((item) => item.id === cursor) + 1 : 0;
  if (cursor && start === 0) return { items: [], nextCursor: null };
  const page = items.slice(start, start + limit);
  const hasMore = start + limit < items.length;
  return { items: page, nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null };
}

let counter = 0;
export function newId(prefix: string): ID {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter}`;
}
