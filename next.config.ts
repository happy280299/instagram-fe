import path from "node:path";
import type { NextConfig } from "next";
import { IMAGE_REMOTE_PATTERNS } from "./src/lib/image-hosts";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this project (avoids picking up a parent lockfile).
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [...IMAGE_REMOTE_PATTERNS],
  },
};

export default nextConfig;
