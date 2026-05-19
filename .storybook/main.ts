import path from "path";
import type { Plugin } from "vite";
import type { StorybookConfig } from "@storybook/react-vite";
import react from "@vitejs/plugin-react";
import { loadEnv, mergeConfig } from "vite";

/**
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time; Vite does not.
 * Stories that pull in `api/` (e.g. via axios) need these defines or the bundle
 * throws `ReferenceError: process is not defined`.
 */
function viteProcessEnvDefine(projectRoot: string, mode: string) {
  const publicEnv = loadEnv(mode, projectRoot, "NEXT_PUBLIC_");
  return {
    "process.env.NEXT_PUBLIC_API_BASE_URL": JSON.stringify(
      publicEnv.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
    ),
    "process.env.NEXT_PUBLIC_ENABLE_FORGOT_PASSWORD_API": JSON.stringify(
      publicEnv.NEXT_PUBLIC_ENABLE_FORGOT_PASSWORD_API ?? "false",
    ),
    "process.env.NEXT_PUBLIC_CHAT_SOCKET_BASE_URL": JSON.stringify(
      publicEnv.NEXT_PUBLIC_CHAT_SOCKET_BASE_URL ?? "",
    ),
    "process.env.NEXT_PUBLIC_CHAT_SOCKET_NAMESPACE": JSON.stringify(
      publicEnv.NEXT_PUBLIC_CHAT_SOCKET_NAMESPACE ?? "",
    ),
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV ?? "development",
    ),
  } as Record<string, string>;
}

function flattenPlugins(plugins: NonNullable<import("vite").UserConfig["plugins"]>): Plugin[] {
  if (!plugins) return [];
  return plugins.flat(10).filter((p): p is Plugin => Boolean(p));
}

function withoutDefaultReactPlugins(pluginList: Plugin[]) {
  return pluginList.filter((p) => {
    const n = p.name ?? "";
    return n !== "vite:react-babel" && n !== "vite:react-refresh" && n !== "vite:react-swc";
  });
}

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-themes"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      tsconfigPath: path.join(__dirname, "tsconfig.json"),
    },
  },
  staticDirs: [
    { from: "../public/assets/svg", to: "/assets/svg" },
    { from: "../public/assets/images", to: "/assets/images" },
  ],
  async viteFinal(cfg, { configDir }) {
    const projectRoot = path.resolve(configDir, "..");
    const mode = cfg.mode ?? "development";
    const baseDefine =
      typeof cfg.define === "object" && cfg.define !== null && !Array.isArray(cfg.define)
        ? cfg.define
        : {};
    const merged = mergeConfig(cfg, {
      esbuild: {
        ...(cfg.esbuild as object | undefined),
        jsx: "automatic",
        tsconfigRaw: {
          compilerOptions: {
            jsx: "react-jsx",
          },
        },
      },
      optimizeDeps: {
        ...cfg.optimizeDeps,
        esbuildOptions: {
          ...cfg.optimizeDeps?.esbuildOptions,
          jsx: "automatic",
          tsconfigRaw: {
            compilerOptions: {
              jsx: "react-jsx",
            },
          },
        },
        include: [
          ...(cfg.optimizeDeps?.include ?? []),
          "@mui/material",
          "@mui/material/styles",
          "@mui/icons-material",
          "@emotion/react",
          "@emotion/styled",
          "@mui/x-date-pickers",
          "@mui/x-date-pickers-pro",
        ],
      },
      define: {
        ...baseDefine,
        ...viteProcessEnvDefine(projectRoot, mode),
      },
      server: {
        watch: {
          ignored: [
            "**/.next/**",
            "**/.next-release/**",
            "**/storybook-static/**",
          ],
        },
      },
      resolve: {
        dedupe: ["react", "react-dom"],
        alias: {
          "@": path.resolve(configDir, "../"),
          "next/link": path.resolve(configDir, "mocks/next-link.tsx"),
          "next/navigation": path.resolve(configDir, "mocks/next-navigation.ts"),
        },
      },
    });

    const plugins = withoutDefaultReactPlugins(flattenPlugins(merged.plugins));
    return {
      ...merged,
      plugins: [...react({ jsxRuntime: "automatic" }), ...plugins],
    };
  },
};

export default config;
