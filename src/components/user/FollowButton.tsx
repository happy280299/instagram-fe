"use client";

import { Button } from "@/components/ui/Button";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/auth";
import type { UserSummary } from "@/types";

interface FollowButtonProps {
  user: Pick<UserSummary, "id" | "username">;
  /** "text" = blue inline link (feed/suggestions), "button" = filled (profile). */
  variant?: "text" | "button";
  className?: string;
}

export function FollowButton({ user, variant = "button", className }: FollowButtonProps) {
  const hydrated = useHydrated();
  const me = useAuthStore((s) => s.user);
  const following = useAuthStore((s) => s.following[user.id] === true);
  const toggleFollow = useAuthStore((s) => s.toggleFollow);

  if (!hydrated || me?.id === user.id) return null;
  const label = following ? "Following" : "Follow";
  const onClick = () => void toggleFollow(user.id, user.username);

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={following}
        aria-label={`${label} ${user.username}`}
        className={cn("text-xs font-semibold", following ? "text-foreground hover:text-muted" : "text-primary hover:text-foreground", className)}
      >
        {label}
      </button>
    );
  }
  return (
    <Button
      size="sm"
      variant={following ? "secondary" : "primary"}
      onClick={onClick}
      aria-pressed={following}
      className={className}
    >
      {label}
    </Button>
  );
}
