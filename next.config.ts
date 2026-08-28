import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ties client bundles to the deploying commit so an already-open tab
  // detects a stale build after a deploy and hard-reloads instead of
  // silently running old client-side code on client-side navigations.
  deploymentId: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12),
};

export default nextConfig;
