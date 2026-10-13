import { Feed } from "@/components/feed/Feed";
import { RightColumn } from "@/components/feed/RightColumn";
import { StoryBar } from "@/components/story/StoryBar";

export default function HomePage() {
  return (
    <div className="flex justify-center md:px-4 md:pt-6">
      <div className="w-full max-w-feed">
        <h1 className="sr-only">Home feed</h1>
        <StoryBar />
        <Feed />
      </div>
      <aside aria-label="Suggestions" className="hidden w-[383px] shrink-0 lg:block">
        <RightColumn />
      </aside>
    </div>
  );
}
