import type { ReactNode } from "react";

/** <main> offset by the collapsed sidebar rail; the expanded sidebar overlays the page instead. */
export function MainContent({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="pt-topbar pb-bottomnav min-h-dvh md:pt-0 md:pb-0 md:pl-(--container-sidebar-collapsed)">
      {children}
    </main>
  );
}
