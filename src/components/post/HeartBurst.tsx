import { Heart } from "lucide-react";

/** Big white heart that pops over media on double-tap. Re-mount (via key) to replay. */
export function HeartBurst() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <Heart className="animate-heart fill-on-media text-on-media size-24 drop-shadow-lg" strokeWidth={0} />
    </span>
  );
}
