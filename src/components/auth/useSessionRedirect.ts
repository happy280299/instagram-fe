"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

/** Sends already-signed-in users away from the auth pages. */
export function useSessionRedirect() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    if (hydrated && user) router.replace(nextPath());
  }, [hydrated, user, router]);
}

/** Safe in-app redirect target from ?next=, falling back to the feed. */
export function nextPath(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") && next !== "/login" ? next : "/";
}
