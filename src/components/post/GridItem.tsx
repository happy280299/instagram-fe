import { Clapperboard, Heart, Layers, MessageCircle, Play } from "lucide-react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/cn";
import { compactNumber } from "@/lib/format";

const SHAPE = { square: "aspect-square", reel: "aspect-[9/16]", fill: "h-full min-h-full" } as const;

interface GridItemProps {
  href: string;
  image: string;
  alt: string;
  likes: number;
  comments: number;
  multiple?: boolean;
  video?: boolean;
  /** Reels: play count shown on the tile, like Instagram. */
  views?: number;
  /** "reel" = 9:16 tile, "fill" = stretch to the grid cell (explore's tall tile). */
  shape?: "square" | "reel" | "fill";
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/** Square tile with an Instagram-style hover overlay showing likes and comments. */
export function GridItem({ href, image, alt, likes, comments, multiple, video, views, shape = "square", className, sizes = "(max-width: 767px) 33vw, 310px", priority }: GridItemProps) {
  return (
    <Link
      href={href}
      aria-label={`${alt}. ${compactNumber(likes)} likes, ${compactNumber(comments)} comments`}
      className={cn("group bg-skeleton relative block overflow-hidden", SHAPE[shape], className)}
    >
      <SafeImage src={image} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {(multiple || video) && (
        <span aria-hidden className="text-on-media absolute top-2 right-2 drop-shadow">
          {video ? <Clapperboard className="size-5" /> : <Layers className="size-5" />}
        </span>
      )}
      {views !== undefined && (
        <span aria-label={`${compactNumber(views)} views`} className="text-on-media absolute bottom-2 left-2 flex items-center gap-1 text-sm font-semibold drop-shadow">
          <Play aria-hidden className="fill-on-media size-4" /> {compactNumber(views)}
        </span>
      )}
      <span
        aria-hidden
        className="text-on-media absolute inset-0 hidden items-center justify-center gap-6 bg-black/30 font-bold group-hover:flex group-focus-visible:flex"
      >
        <span className="flex items-center gap-1.5">
          <Heart className="fill-on-media size-5" /> {compactNumber(likes)}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="fill-on-media size-5 -scale-x-100" /> {compactNumber(comments)}
        </span>
      </span>
    </Link>
  );
}
