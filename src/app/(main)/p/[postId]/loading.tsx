import { PostDetailSkeleton } from "@/components/post/PostSkeleton";

export default function Loading() {
  return (
    <div className="max-w-content mx-auto w-full md:px-5 md:pt-8">
      <PostDetailSkeleton className="border-separator md:h-[min(80dvh,700px)] md:border" />
    </div>
  );
}
