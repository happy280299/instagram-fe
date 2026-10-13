"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isCompactRoute } from "./nav";

/** <main> offset to match the sidebar width for the current route/breakpoint. */
export function MainContent({ children }: { children: ReactNode }) {
  const compact = isCompactRoute(usePathname());
  return (
    <main
      id="main"
      className={cn(
        "pt-topbar pb-bottomnav min-h-dvh md:pt-0 md:pb-0 md:pl-(--container-sidebar-collapsed)",
        !compact && "xl:pl-(--container-sidebar)",
      )}
    >
      {children}
    </main>
  );
}
