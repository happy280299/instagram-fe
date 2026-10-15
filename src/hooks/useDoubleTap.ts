"use client";

import { useCallback, useEffect, useRef } from "react";

interface Options {
  /** Fired when no second tap follows within `delay`, so it lags a single tap by that much. */
  onSingleTap?: () => void;
  delay?: number;
}

/** Returns a click handler that fires `onDoubleTap` for two taps within `delay`ms (works on touch too). */
export function useDoubleTap(onDoubleTap: () => void, { onSingleTap, delay = 300 }: Options = {}) {
  const last = useRef(0);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (pending.current && clearTimeout(pending.current)), []);

  return useCallback(() => {
    const now = Date.now();
    if (pending.current) clearTimeout(pending.current);
    pending.current = null;
    if (now - last.current < delay) {
      last.current = 0;
      onDoubleTap();
      return;
    }
    last.current = now;
    if (onSingleTap) pending.current = setTimeout(onSingleTap, delay);
  }, [onDoubleTap, onSingleTap, delay]);
}
