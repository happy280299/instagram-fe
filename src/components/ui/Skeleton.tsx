import { cn } from "@/lib/cn";

export function Skeleton({ className, rounded = "md" }: { className?: string; rounded?: "md" | "full" | "none" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-skeleton block animate-pulse",
        rounded === "full" ? "rounded-full" : rounded === "md" ? "rounded-md" : "",
        className,
      )}
    />
  );
}
