"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRealtimeChat } from "@/components/direct/useRealtimeChat";
import { useRealtimeNotifications } from "@/components/notification/useRealtimeNotifications";
import { Toaster } from "@/components/ui/Toaster";
import { useAuthStore } from "@/store/auth";
import { usePostStore } from "@/store/post";
import { useUIStore } from "@/store/ui";

/**
 * Rehydrates persisted stores after mount (avoids SSR/client mismatches), keeps
 * <html data-theme> in sync with the theme preference + OS setting, and runs the realtime socket.
 */
export function AppProviders() {
  const theme = useUIStore((s) => s.theme);
  const [themeReady, setThemeReady] = useState(false);
  useRealtimeNotifications();
  useRealtimeChat();

  // Layout effect: runs before any passive effect in the tree, so no component
  // can write default state over persisted state before it has been read.
  useLayoutEffect(() => {
    void Promise.resolve(useUIStore.persist.rehydrate()).then(() => setThemeReady(true));
    void useAuthStore.persist.rehydrate();
    void usePostStore.persist.rehydrate();
  }, []);

  // Wait for the persisted preference; the inline script already applied it pre-paint.
  useEffect(() => {
    if (!themeReady) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme, themeReady]);

  return <Toaster />;
}
