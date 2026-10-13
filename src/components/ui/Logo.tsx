import { cn } from "@/lib/cn";

/** Instaclone's own mark: a rounded tile with an aperture-style spark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-6", className)} fill="none">
      <rect x="2" y="2" width="28" height="28" rx="9" stroke="currentColor" strokeWidth="2.5" />
      <path d="M16 8.5l2.2 5.3 5.3 2.2-5.3 2.2L16 23.5l-2.2-5.3L8.5 16l5.3-2.2z" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-2xl font-bold tracking-tight italic select-none", className)}>
      Insta<span className="text-primary">clone</span>
    </span>
  );
}
