import { notFound } from "next/navigation";
import { PostModal } from "@/components/post/PostModal";
import { getPost } from "@/lib/data";

/** Intercepts client-side navigation to /p/[postId] and shows it over the current page. */
export default async function InterceptedPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const post = getPost((await params).postId);
  if (!post) notFound();
  return <PostModal post={post} />;
}
