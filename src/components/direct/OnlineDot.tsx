import { cn } from "@/lib/cn";

/** Green "in the app now" dot on an avatar's corner. Place inside a `relative` box. */
export function OnlineDot({ className }: { className?: string }) {
  return <span aria-hidden className={cn("bg-online border-background absolute right-0 bottom-0 size-3.5 rounded-full border-2", className)} />;
}
