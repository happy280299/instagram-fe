import Link from "next/link";

export function NotFoundView({ title = "Sorry, this page isn't available." }: { title?: string }) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p>
        The link you followed may be broken, or the page may have been removed.{" "}
        <Link href="/" className="text-primary hover:underline">
          Go back to Instaclone.
        </Link>
      </p>
    </div>
  );
}
