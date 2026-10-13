import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="border-foreground flex size-16 items-center justify-center rounded-full border-2">
        <Icon aria-hidden className="size-8" strokeWidth={1.5} />
      </span>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      {description && <p className="text-muted max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
