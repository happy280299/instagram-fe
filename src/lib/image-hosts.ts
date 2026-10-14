/** Hosts next/image may optimize. Shared by next.config.ts and SafeImage, which skips optimization for any other host. */
export const IMAGE_REMOTE_PATTERNS = [
  // Files uploaded to the backend are served from its /static route.
  { protocol: "http", hostname: "localhost" },
  // Post uploads (POST /api/uploads stores them on Cloudinary).
  { protocol: "https", hostname: "res.cloudinary.com" },
  { protocol: "https", hostname: "picsum.photos" },
  { protocol: "https", hostname: "fastly.picsum.photos" },
  { protocol: "https", hostname: "i.pravatar.cc" },
  // Reels sample-video hosts (videos stream via <video>; listed so posters/thumbnails can be optimized too).
  { protocol: "https", hostname: "test-videos.co.uk" },
  { protocol: "https", hostname: "interactive-examples.mdn.mozilla.net" },
  { protocol: "https", hostname: "media.w3.org" },
  { protocol: "https", hostname: "vjs.zencdn.net" },
  { protocol: "https", hostname: "download.samplelib.com" },
] as const;
