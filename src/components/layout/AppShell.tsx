import type { ReactNode } from "react";
import { AuthGate } from "./AuthGate";
import { MainContent } from "./MainContent";
import { BottomNav } from "./BottomNav";
import { OverlayHost } from "./OverlayHost";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="focus:bg-primary focus:text-on-media sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-70 focus:rounded focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Sidebar />
      <TopBar />
      <MainContent>{children}</MainContent>
      <BottomNav />
      <AuthGate />
      <OverlayHost />
    </div>
  );
}
