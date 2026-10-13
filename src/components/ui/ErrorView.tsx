"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "./Button";

interface ErrorViewProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorView({ title = "Something went wrong", description = "Please try again in a moment.", onRetry }: ErrorViewProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-24 text-center">
      <AlertTriangle aria-hidden className="text-muted size-12" strokeWidth={1.5} />
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted max-w-sm">{description}</p>
      <div className="mt-2 flex gap-2">
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        <Link href="/" className="bg-hover hover:bg-separator inline-flex h-9 items-center rounded-lg px-4 font-semibold">
          Go home
        </Link>
      </div>
    </div>
  );
}
