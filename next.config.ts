import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
  },
};

export default nextConfig;
