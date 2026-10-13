import { cn } from "@/lib/cn";
import { SafeImage } from "./SafeImage";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "profile" | "xl";
export type RingState = "none" | "unseen" | "seen";

const SIZE: Record<AvatarSize, { box: string; px: number }> = {
  xs: { box: "size-avatar-xs", px: 24 },
  sm: { box: "size-avatar-sm", px: 32 },
  md: { box: "size-avatar-md", px: 44 },
  lg: { box: "size-avatar-lg", px: 56 },
  profile: { box: "size-avatar-profile", px: 77 },
  xl: { box: "size-avatar-xl", px: 150 },
};

interface AvatarProps {
  src: string;
  username: string;
  size?: AvatarSize;
  ring?: RingState;
  className?: string;
  priority?: boolean;
}

export function Avatar({ src, username, size = "sm", ring = "none", className, priority }: AvatarProps) {
  const { box, px } = SIZE[size];
  const image = (
    <span className={cn("bg-skeleton relative block shrink-0 overflow-hidden rounded-full", box)}>
      <SafeImage
        src={src}
        alt={`${username}'s profile picture`}
        fill
        sizes={`${px}px`}
        priority={priority}
        className="object-cover"
      />
    </span>
  );
  if (ring === "none") return <span className={cn("inline-block shrink-0", className)}>{image}</span>;
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full p-[2px]",
        ring === "unseen" ? "story-ring" : "bg-separator",
        className,
      )}
    >
      <span className="bg-background block rounded-full p-[2px]">{image}</span>
    </span>
  );
}
