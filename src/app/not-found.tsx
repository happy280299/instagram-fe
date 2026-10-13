import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/ui/Logo";
import { NotFoundView } from "@/components/ui/NotFoundView";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="min-h-dvh">
      <header className="border-separator flex h-16 items-center border-b px-6">
        <Link href="/" aria-label="Instaclone home">
          <Wordmark />
        </Link>
      </header>
      <main>
        <NotFoundView />
      </main>
    </div>
  );
}
