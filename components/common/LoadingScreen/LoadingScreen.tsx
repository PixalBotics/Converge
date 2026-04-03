"use client";

import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import type { LoadingScreenProps } from "./LoadingScreen.types";
import styles from "./LoadingScreen.module.css";

const fullPageDark = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  background: "radial-gradient(50% 50% at 50% 50%, #09013F 0%, #00011A 100%)",
  gap: 2,
};

export function LoadingScreen({
  message,
  fullPage = true,
}: LoadingScreenProps) {
  const containerSx = fullPage
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
        <Typography variant="body2" color="rgba(255,255,255,0.7)">
          {message}
        </Typography>
      )}
    </Box>
  );
}
