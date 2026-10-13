"use client";

import "./globals.css";
import { ErrorView } from "@/components/ui/ErrorView";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <ErrorView onRetry={reset} />
      </body>
    </html>
  );
}
