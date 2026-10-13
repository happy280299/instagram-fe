import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("md:border-separator w-full px-10 md:border", className)}>{children}</div>;
}

export function OrDivider() {
  return (
    <div className="text-muted my-4 flex items-center gap-4 text-xs font-semibold" role="separator">
      <span className="bg-separator h-px flex-1" />
      OR
      <span className="bg-separator h-px flex-1" />
    </div>
  );
}
