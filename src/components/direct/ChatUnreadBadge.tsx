"use client";

import { useChatUnread } from "./useChatUnread";

/** Red count over the Messages icon, like Instagram. Place inside a `relative` box. */
export function ChatUnreadBadge() {
  const count = useChatUnread();
  if (count === 0) return null;
  return (
    <>
      <span
        aria-hidden
        className="bg-like text-on-media border-background absolute -top-1.5 -right-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-2 px-1 text-[10px] leading-none font-bold"
      >
        {count > 9 ? "9+" : count}
      </span>
      <span className="sr-only">, {count} unread</span>
    </>
  );
}
