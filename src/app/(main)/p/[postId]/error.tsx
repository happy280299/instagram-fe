"use client";

import { ErrorView } from "@/components/ui/ErrorView";

export default function PostError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorView title="Couldn't load this post" onRetry={reset} />;
}
