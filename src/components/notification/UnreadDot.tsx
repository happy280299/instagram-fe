"use client";

import { useUnreadNotifications } from "./useUnreadNotifications";

/** Red dot over the heart icon when there's unread activity. Place inside a `relative` box. */
export function UnreadDot() {
  const count = useUnreadNotifications();
  if (count === 0) return null;
  return (
    <>
      <span aria-hidden className="bg-like border-background absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2" />
      <span className="sr-only">, {count} unread</span>
    </>
  );
}
