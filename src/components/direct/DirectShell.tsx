"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ConversationList } from "./ConversationList";

/** Two panes on ≥768px; on mobile shows either the inbox or the open thread. */
export function DirectShell({ children }: { children: ReactNode }) {
  const inThread = usePathname().startsWith("/direct/t/");
  return (
    <div className="flex h-[calc(100dvh-var(--spacing-topbar)-var(--spacing-bottomnav))] md:h-dvh">
      <aside
        aria-label="Inbox"
        className={cn("border-separator w-full shrink-0 md:block md:w-[300px] md:border-r xl:w-[397px]", inThread && "hidden")}
      >
        <ConversationList />
      </aside>
      <section className={cn("min-w-0 flex-1 md:flex", inThread ? "flex" : "hidden")}>{children}</section>
    </div>
  );
}
