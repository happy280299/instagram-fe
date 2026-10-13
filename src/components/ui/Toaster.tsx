"use client";

import { useUIStore } from "@/store/ui";

/** Global toast region; messages come from useUIStore().toast(). */
export function Toaster() {
  const toasts = useUIStore((s) => s.toasts);
  const dismiss = useUIStore((s) => s.dismissToast);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--spacing-bottomnav)+12px)] z-60 flex flex-col items-center gap-2 px-4 md:bottom-6"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className="animate-toast bg-foreground text-background pointer-events-auto w-full max-w-md rounded-lg px-4 py-3 text-left text-sm shadow-lg"
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
