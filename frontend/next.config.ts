import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so a stray package-lock.json in the home directory is ignored.
  turbopack: { root: path.resolve(__dirname) },
  // Hide the floating Next.js dev badge so demo videos and screenshots stay clean.
  devIndicators: false,
};

export default nextConfig;
