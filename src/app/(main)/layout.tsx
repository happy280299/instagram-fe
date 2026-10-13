import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

// Mock data is shifted relative to "now", so render per request.
export const dynamic = "force-dynamic";

export default function MainLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <AppShell>
      {children}
      {modal}
    </AppShell>
  );
}
