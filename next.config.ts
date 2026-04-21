import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Avoid serving stale optimized versions of replaced `public/` brand files in dev.
    minimumCacheTTL: 0,
  },
};

export default nextConfig;
