"use client";

import type { CSSProperties, ReactNode } from "react";
import Box from "@mui/material/Box";
import type { BoxProps } from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import styles from "./ModalGlassShell.module.css";

export type ModalGlassShellProps = Omit<BoxProps, "children"> & {
  children: ReactNode;
};

function buildModalGlassShadow(theme: AppTheme, isLight: boolean): string {
  const ring = isLight ? alpha("#0f172a", 0.08) : alpha("#000000", 0.55);
  const liftA = isLight ? alpha("#0f172a", 0.14) : "rgba(0, 0, 0, 0.5)";
  const liftB = isLight ? alpha("#0f172a", 0.08) : "rgba(0, 0, 0, 0.28)";
  const accent = theme.palette.primary.main;
  const accentGlow = isLight ? alpha(accent, 0.12) : alpha(accent, 0.18);
  return [
    `0 0 0 1px ${ring}`,
    `0 0 40px -8px ${accentGlow}`,
    `0 28px 72px ${liftA}`,
    `0 12px 28px ${liftB}`,
    "inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    "inset 0 -1px 0 rgba(0, 0, 0, 0.16)",
    "inset 0 0 48px rgba(255, 255, 255, 0.06)",
  ].join(", ");
}

/**
 * Glass morphism surface for modals: theme blur, accent-aware rim, specular accents.
 */
export function ModalGlassShell({ children, sx, style, ...rest }: ModalGlassShellProps) {
  const theme = useTheme() as AppTheme;
  const isLight = theme.palette.mode === "light";
  const accent = theme.palette.primary.main;

  const borderMain = isLight
    ? alpha("#0f172a", 0.16)
    : alpha("#ffffff", 0.34);
  const specular = isLight ? alpha("#ffffff", 0.95) : alpha("#ffffff", 0.82);
  const specularSoft = isLight ? alpha("#ffffff", 0.7) : alpha("#ffffff", 0.5);

  const cssVars = {
    "--modal-glass-blur": theme.app.dashboard.cardBackdropBlur,
    "--modal-glass-border": borderMain,
    "--modal-glass-specular": specular,
    "--modal-glass-specular-soft": specularSoft,
    "--modal-glass-shadow": buildModalGlassShadow(theme, isLight),
    "--modal-glass-face": isLight
      ? `linear-gradient(168deg, ${alpha("#ffffff", 0.72)} 0%, ${alpha("#ffffff", 0.38)} 45%, ${alpha(
          "#f8fafc",
          0.52,
        )} 100%)`
      : `linear-gradient(158deg, ${alpha("#ffffff", 0.22)} 0%, ${alpha("#ffffff", 0.09)} 40%, ${alpha(
          accent,
          0.08,
        )} 100%)`,
  } as CSSProperties;

  return (
    <Box
      className={styles.root}
      style={{ ...cssVars, ...style }}
      sx={sx as SxProps<Theme>}
      {...rest}
    >
      {children}
    </Box>
  );
}
