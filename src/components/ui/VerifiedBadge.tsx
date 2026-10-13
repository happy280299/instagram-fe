import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ className = "size-3.5" }: { className?: string }) {
  return (
    <BadgeCheck aria-label="Verified" role="img" className={`fill-primary text-on-media inline shrink-0 ${className}`} strokeWidth={2.5} />
  );
}
