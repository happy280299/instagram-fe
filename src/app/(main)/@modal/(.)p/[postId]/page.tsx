import { PostDetail } from "@/components/post/PostDetail";
import { PostModal } from "@/components/post/PostModal";
import { RemotePost } from "@/components/post/RemotePost";
import { getPost } from "@/lib/data";

/** Intercepts client-side navigation to /p/[postId] and shows it over the current page. */
export default async function InterceptedPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const post = getPost(postId);
  // Not a mock post: load it from the backend on the client.
  if (!post) return <RemotePost postId={postId} inModal />;
  return (
    <PostModal label={`Post by ${post.author.username}`}>
      <PostDetail post={post} className="h-full" />
    </PostModal>
  );
}
