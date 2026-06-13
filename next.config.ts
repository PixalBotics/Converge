import type { NextConfig } from "next";
import path from "path";

// Vercel and Netlify’s Next runtime expect the default `.next` output directory.
// Locally we use custom dirs so dev (`.next-dev`) and prod (`.next-release`) do not fight on Windows.
const isVercel = process.env.VERCEL === "1";
const isNetlify = process.env.NETLIFY === "true";
const isEmbedDev = process.env.WIDGET_EMBED_DEV === "1";
const distDir =
  isVercel || isNetlify
    ? ".next"
    : isEmbedDev
      ? ".next-embed-dev"
      : process.env.NODE_ENV === "production"
        ? ".next-release"
        : ".next-dev";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  distDir,
  compiler: isProduction
    ? {
        removeConsole: { exclude: ["error", "warn"] },
      }
    : undefined,
  /** Broken nested ESLint deps on some Windows installs; run `npm run lint` separately. */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    /** Lowers webpack peak memory (Next.js 15+); slight compile-time tradeoff. */
    webpackMemoryOptimizations: true,
  },
  async headers() {
    if (!isProduction) return [];

    const sharedSecurityHeaders = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ] as const;

    return [
      /**
       * Visitor widget iframe — must be embeddable on customer sites (cross-origin).
       * No X-Frame-Options; CSP frame-ancestors allows any parent.
       */
      {
        source: "/embed/:path*",
        headers: [
          ...sharedSecurityHeaders,
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
      /** Dashboard + auth — keep clickjacking protection. Excludes /embed/* via lookahead. */
      {
        source: "/((?!embed/).*)",
        headers: [
          ...sharedSecurityHeaders,
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/widget-static/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/widget-static/:path*`,
      },
    ];
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
     * Filesystem cache keeps compile times reasonable without holding the full graph in RAM.
     * @see https://nextjs.org/docs/app/guides/memory-usage
     */
    if (dev && config.cache && typeof config.cache === "object") {
      // Preserve Next's cache (version, cacheDirectory, buildDependencies). Overriding
      // buildDependencies with __filename points at ephemeral next.config.compiled.js
      // and triggers PackFileCacheStrategy resolve warnings.
      config.cache = {
        ...config.cache,
        compression: false,
      };
    } else if (config.cache) {
      config.cache = Object.freeze({ type: "memory" });
    }

    return config;
  },
};

export default nextConfig;
