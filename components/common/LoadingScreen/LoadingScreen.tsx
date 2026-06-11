"use client";

import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { FULL_PAGE_LOADER_BACKGROUND_GRADIENT } from "@/lib/theme/full-page-loader-background";
import type { LoadingScreenProps } from "./LoadingScreen.types";
import styles from "./LoadingScreen.module.css";

const fullPageDark = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  /**
   * Follow whichever page-level theme is active (auth/dashboard/custom).
   * If parent/body has no explicit background, keep existing fallback gradient.
   */
  background: "inherit",
  backgroundImage: `var(--dashboard-bg, ${FULL_PAGE_LOADER_BACKGROUND_GRADIENT})`,
  gap: 2,
};

/** In-dashboard route fallback: no auth gradient. Avoid `flex:1` on `<main>` — it breaks page grids. */
const embeddedInShell = {
  width: "100%",
  boxSizing: "border-box",
  minHeight: "min(calc(100dvh - 200px), 900px)",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  background: "transparent",
  backgroundImage: "none",
};

export function LoadingScreen({
  message,
  fullPage = true,
  embedded = false,
}: LoadingScreenProps) {
  const containerSx = embedded
    ? embeddedInShell
    : fullPage
      ? fullPageDark
      : {
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        };

  return (
    <Box sx={containerSx}>
      <div className={styles.loader} role="status" aria-label="Loading" />
      {message != null && message !== "" && (
        <Typography
          variant="body2"
          {...(embedded ? {} : { color: "rgba(255,255,255,0.7)" })}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
