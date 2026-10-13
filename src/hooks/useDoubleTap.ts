"use client";

import { useCallback, useRef } from "react";

/** Returns a click handler that fires `onDoubleTap` for two taps within `delay`ms (works on touch too). */
export function useDoubleTap(onDoubleTap: () => void, delay = 300) {
  const last = useRef(0);
  return useCallback(() => {
    const now = Date.now();
    if (now - last.current < delay) {
      last.current = 0;
      onDoubleTap();
    } else {
      last.current = now;
    }
  }, [onDoubleTap, delay]);
}
