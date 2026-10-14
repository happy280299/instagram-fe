import type { Metadata } from "next";
import Link from "next/link";
import { PostDetail } from "@/components/post/PostDetail";
import { PostGrid } from "@/components/post/PostGrid";
import { RemotePost } from "@/components/post/RemotePost";
import { getMorePostsFrom, getPost } from "@/lib/data";

type Params = { params: Promise<{ postId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = getPost((await params).postId);
  // Backend posts load on the client, so the server has no details to show here.
  if (!post) return { title: "Post" };
  const title = `${post.author.fullName} on Instaclone`;
  const description = `${post.likes.toLocaleString("en-US")} likes, ${post.commentsCount} comments — ${post.author.username}: “${post.caption.slice(0, 140)}”`;
  const image = post.media[0];
  return {
    title,
    description,
    alternates: { canonical: `/p/${post.id}` },
    openGraph: { title, description, type: "article", images: [{ url: image.url, width: image.width, height: image.height, alt: image.alt }] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default async function PostPage({ params }: Params) {
  const { postId } = await params;
  const post = getPost(postId);
  if (!post) return <RemotePost postId={postId} />;
  const more = getMorePostsFrom(post.authorId, post.id);

  return (
    <div className="max-w-content mx-auto w-full md:px-5 md:pt-8">
      <PostDetail post={post} className="border-separator md:h-[min(80dvh,700px)] md:border" />
      {more.length > 0 && (
        <section className="border-separator mt-12 border-t pt-10 pb-10">
          <h2 className="text-muted mb-4 px-4 text-sm font-semibold md:px-0">
            More posts from{" "}
            <Link href={`/${post.author.username}`} className="text-foreground hover:opacity-60">
              {post.author.username}
            </Link>
          </h2>
          <PostGrid posts={more} />
        </section>
      )}
    </div>
  );
}
