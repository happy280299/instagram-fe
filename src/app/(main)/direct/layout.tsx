import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DirectShell } from "@/components/direct/DirectShell";

export const metadata: Metadata = { title: "Inbox • Direct" };

export default function DirectLayout({ children }: { children: ReactNode }) {
  return <DirectShell>{children}</DirectShell>;
}
