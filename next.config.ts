import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disabling advanced caching to allow dynamic route segments
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
