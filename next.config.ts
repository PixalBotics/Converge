import type { NextConfig } from "next";
import path from "path";

// Vercel's Next.js builder always expects output under `.next`. Locally we use
// custom dirs so dev (`.next-dev`) and prod (`.next-release`) do not fight on Windows.
const isVercel = process.env.VERCEL === "1";
const distDir = isVercel
  ? ".next"
  : process.env.NODE_ENV === "production"
    ? ".next-release"
    : ".next-dev";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  distDir,
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
