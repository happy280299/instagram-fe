"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/ui/ErrorView";

export default function MainError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <ErrorView onRetry={reset} />;
}
