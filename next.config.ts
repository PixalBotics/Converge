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
  /** tsParticles: transpile so Next can bundle ESM cleanly. */
  transpilePackages: ["@tsparticles/react", "tsparticles", "@tsparticles/engine"],
  webpack: (config) => {
    /**
     * tsParticles `exports` expose both `browser` and `import`. Webpack often prefers `browser`
     * first; a bad Windows unpack can leave `browser/*.js` missing (only `*.DELETE.*` stubs).
     * Put `import` / `module` first and move `browser` last so `esm/` wins when present.
     */
    const prev = [...(config.resolve.conditionNames ?? [])];
    const withoutDup = prev.filter(
      (c) => c !== "import" && c !== "module" && c !== "browser"
    );
    config.resolve.conditionNames = ["import", "module", ...withoutDup, "browser"];
    return config;
  },
};

export default nextConfig;
