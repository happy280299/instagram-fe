import { Clapperboard } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ReelWithAuthor } from "@/types";
import { GridItem } from "@/components/post/GridItem";

export function ReelsGrid({ reels }: { reels: ReelWithAuthor[] }) {
  if (reels.length === 0) {
    return <EmptyState icon={Clapperboard} title="No reels yet" description="Reels shared by this account will appear here." />;
  }
  return (
    <ul className="grid grid-cols-3 gap-0.5 md:gap-1">
      {reels.map((reel) => (
        <li key={reel.id}>
          <GridItem
            href={`/reels?r=${reel.id}`}
            image={reel.poster}
            alt={`Reel by ${reel.author.username}`}
            likes={reel.likes}
            comments={reel.commentsCount}
            shape="reel"
            video
          />
        </li>
      ))}
    </ul>
  );
}
