"use client";

import { useEffect, useRef, useState } from "react";

interface StoryProgressProps {
  count: number;
  active: number;
  paused: boolean;
  duration?: number;
  onComplete: () => void;
}

/**
 * Segmented progress bars. Re-mount (via `key`) for each slide so the active
 * segment's timer restarts from zero.
 */
export function StoryProgress({ count, active, paused, duration = 5000, onComplete }: StoryProgressProps) {
  const [progress, setProgress] = useState(0);
  const elapsed = useRef(0);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (paused) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsed.current += now - last;
      last = now;
      const p = Math.min(elapsed.current / duration, 1);
      setProgress(p);
      if (p >= 1) completeRef.current();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, duration]);

  return (
    <div className="flex gap-1" role="progressbar" aria-label="Story progress" aria-valuemin={0} aria-valuemax={count} aria-valuenow={active + progress}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="bg-on-media/35 h-0.5 flex-1 overflow-hidden rounded-full">
          <span
            className="bg-on-media block h-full origin-left"
            style={{ transform: `scaleX(${i < active ? 1 : i === active ? progress : 0})` }}
          />
        </span>
      ))}
    </div>
  );
}
