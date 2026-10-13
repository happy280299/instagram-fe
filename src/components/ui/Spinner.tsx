import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const box = size === "sm" ? "size-4" : size === "lg" ? "size-8" : "size-6";
  return (
    <span role="status" className={cn("text-muted inline-flex", className)}>
      <Loader2 aria-hidden className={cn("animate-spin", box)} />
      <span className="sr-only">Loading</span>
    </span>
  );
}
