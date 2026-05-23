import type { NextConfig } from "next";
import path from "path";

// Vercel and Netlify’s Next runtime expect the default `.next` output directory.
// Locally we use custom dirs so dev (`.next-dev`) and prod (`.next-release`) do not fight on Windows.
const isVercel = process.env.VERCEL === "1";
const isNetlify = process.env.NETLIFY === "true";
const distDir =
  isVercel || isNetlify
    ? ".next"
    : process.env.NODE_ENV === "production"
      ? ".next-release"
      : ".next-dev";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  distDir,
  /** Broken nested ESLint deps on some Windows installs; run `npm run lint` separately. */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    /** Lowers webpack peak memory (Next.js 15+); slight compile-time tradeoff. */
    webpackMemoryOptimizations: true,
  },
  async redirects() {
    return [
      { source: "/login", destination: "/auth/login", permanent: true },
      {
        source: "/forgot-password",
        destination: "/auth/forgot-password",
        permanent: true,
      },
      { source: "/set-password", destination: "/auth/set-password", permanent: true },
      {
        source: "/verify-code",
        destination: "/auth/verify-code",
        permanent: true,
      },
      {
        source: "/dashboard/all-companies",
        destination: "/dashboard/companies",
        permanent: true,
      },
    ];
  },
  /** tsParticles: transpile so Next can bundle ESM cleanly. */
  transpilePackages: ["@tsparticles/react", "tsparticles", "@tsparticles/engine"],
  webpack: (config, { dev, isServer }) => {
    /**
     * tsParticles `exports` expose both `browser` and `import`. Webpack often prefers `browser`
     * first; a bad Windows unpack can leave `browser/*.js` missing (only `*.DELETE.*` stubs).
     * Put `import` / `module` first and move `browser` last so `esm/` wins when present.
     */
    // Keep Node/server resolution untouched. Overriding condition names for SSR
    // can force browser builds (e.g. emotion-cache.browser) and crash with
    // "document is not defined".
    if (!isServer) {
      const prev = [...(config.resolve.conditionNames ?? [])];
      const withoutDup = prev.filter(
        (c) => c !== "import" && c !== "module" && c !== "browser"
      );
      config.resolve.conditionNames = ["import", "module", ...withoutDup, "browser"];
    }

    /**
     * Large apps on Windows can exhaust the default Node heap when webpack persists
     * pack caches (PackFileCacheStrategy / Array buffer allocation failed).
     * @see https://nextjs.org/docs/app/guides/memory-usage
     */
    if (dev) {
      config.cache = false;
    } else if (config.cache) {
      config.cache = Object.freeze({ type: "memory" });
    }

    return config;
  },
};

export default nextConfig;
