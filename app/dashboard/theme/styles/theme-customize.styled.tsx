"use client";

/**
 * `/dashboard/theme` — all visual layout + chrome lives here (MUI `styled`).
 * Page/components import these primitives only; avoid ad-hoc `sx` in feature files.
 */

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { PaletteOutlined } from "@mui/icons-material";
import { alpha, styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { Button, Typography } from "@/components/common";
import {
  selectionCircleShadow,
  selectionHaloSafePaddingPx,
  selectionOutlineCss,
} from "@/lib/design-system";
import type { AppTheme } from "@/theme/theme";
import { THEME_SWATCH } from "./theme-customize.constants";

function appTokens(theme: Theme) {
  return (theme as AppTheme).app;
}

function customAccentConicBorderGradient(theme: Theme): string {
  const d = appTokens(theme).dashboard;
  return `conic-gradient(from 200deg, ${d.accentCyan}, ${d.accentPurple}, ${d.accentPink}, ${d.accentYellow}, ${d.accentCyan})`;
}

function gradientPrimaryButtonCss(theme: Theme) {
  const d = appTokens(theme).dashboard;
  return {
    background: d.gradientButton,
    color: d.gradientButtonText,
    boxShadow: "none",
    border: `1px solid ${d.overlayBorder}`,
    "&:hover": {
      background: d.gradientButton,
      color: d.gradientButtonText,
      boxShadow: "none",
    },
  };
}

// —— Page shell ——————————————————————————————————————————————————————————————

export const ThemeCustomizeRoot = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 1600,
  marginLeft: "auto",
  marginRight: "auto",
  boxSizing: "border-box",
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(0.5),
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
}));

export const ThemeCustomizeDefaultRow = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const ThemeCustomizeSwatchesRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  alignItems: "flex-start",
  padding: selectionHaloSafePaddingPx,
  margin: theme.spacing(-1),
  overflow: "visible",
}));

export const ThemeCustomizeColorGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  width: "100%",
  boxSizing: "border-box",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  padding: selectionHaloSafePaddingPx,
  marginLeft: theme.spacing(-1),
  marginRight: theme.spacing(-1),
  overflow: "visible",
  justifyItems: "center",
  alignItems: "start",
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  },
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
  },
}));

// —— Typography —————————————————————————————————————————————————————————————

export const ThemePageTitle = styled(Typography)(({ theme }) => ({
  color: appTokens(theme).text.primary,
  marginBottom: theme.spacing(0.5),
  fontSize: 22,
  [theme.breakpoints.up("sm")]: {
    fontSize: 26,
  },
}));

export const ThemePageSubtitle = styled(Typography)(({ theme }) => ({
  color: appTokens(theme).dashboard.textMuted,
  marginBottom: theme.spacing(1.5),
}));

export const ThemeSectionLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: appTokens(theme).text.primary,
  marginBottom: theme.spacing(1.5),
  letterSpacing: 0.3,
  textTransform: "uppercase",
  fontSize: 12,
}));

export const ThemeStatusLine = styled(Typography)(({ theme }) => ({
  color: appTokens(theme).dashboard.textMuted,
  marginBottom: theme.spacing(1.5),
}));

export const ThemeSavedLine = styled(ThemeStatusLine)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

// —— Alerts & actions ———————————————————————————————————————————————————————

export const ThemeUnsavedAlert = styled(Alert)(({ theme }) => {
  const app = appTokens(theme);
  return {
    marginBottom: theme.spacing(2.5),
    alignItems: "center",
    borderColor: alpha(app.dashboard.accentOrange, 0.55),
    backgroundColor: alpha(app.dashboard.accentOrange, 0.08),
    color: app.text.primary,
    "& .MuiAlert-message": { width: "100%" },
  };
});

export const ThemeSaveAccountButton = styled(Button)(({ theme }) => ({
  ...gradientPrimaryButtonCss(theme),
  fontWeight: 700,
  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.35 : 0.12)}`,
}));

// —— Swatches —————————————————————————————————————————————————————————————————

export type ThemeSwatchButtonRootProps = {
  $selected: boolean;
  $shape: "tile" | "circle";
  $compact?: boolean;
};

export const ThemeSwatchButtonRoot = styled("button", {
  shouldForwardProp: (prop) => !["$selected", "$shape", "$compact"].includes(String(prop)),
})<ThemeSwatchButtonRootProps>(({ theme, $selected, $shape, $compact }) => {
  const isCircle = $shape === "circle";
  const primary = theme.palette.primary.main;
  return {
    position: "relative",
    margin: 0,
    padding: 0,
    border: "none",
    cursor: "pointer",
    background: "transparent",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    overflow: isCircle ? "hidden" : "visible",
    boxShadow: $selected && isCircle ? selectionCircleShadow(theme) : "none",
    transition: "box-shadow 0.15s ease, transform 0.15s ease, outline 0.15s ease",
    flexShrink: 0,
    ...selectionOutlineCss(theme, $selected && !isCircle),
    "&:hover": isCircle ? { transform: "scale(1.06)" } : {},
    "&:focus-visible": {
      outline: `2px solid ${primary}`,
      outlineOffset: 2,
    },
    ...(isCircle
      ? {
          width: THEME_SWATCH.circlePx,
          height: THEME_SWATCH.circlePx,
          borderRadius: "50%",
        }
      : {
          borderRadius: THEME_SWATCH.tileRadius,
          ...($compact
            ? {
                width: THEME_SWATCH.tileCompactPx,
                height: THEME_SWATCH.tileCompactPx,
              }
            : {
                width: "100%",
                aspectRatio: "1",
                minWidth: 0,
                marginLeft: "auto",
                marginRight: "auto",
              }),
        }),
  };
});

export type ThemeSwatchFillProps = {
  $shape: "tile" | "circle";
  $background: string;
};

export const ThemeSwatchFill = styled("span", {
  shouldForwardProp: (prop) => !["$shape", "$background"].includes(String(prop)),
})<ThemeSwatchFillProps>(({ theme, $shape, $background }) => ({
  display: "block",
  flex: "1 1 auto",
  alignSelf: "stretch",
  width: "100%",
  minHeight: "100%",
  background: $background,
  backgroundClip: "padding-box",
  borderRadius: $shape === "circle" ? "50%" : THEME_SWATCH.tileRadius,
  boxShadow:
    $shape === "circle"
      ? `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.12)}`
      : undefined,
}));

// —— Custom color picker trigger —————————————————————————————————————————————

export type ThemeColorPickerTriggerProps = {
  $selected: boolean;
};

export const ThemeColorPickerTrigger = styled("button", {
  shouldForwardProp: (prop) => prop !== "$selected",
})<ThemeColorPickerTriggerProps>(({ theme, $selected }) => ({
  position: "relative",
  margin: 0,
  padding: THEME_SWATCH.pickerRingPaddingPx,
  width: THEME_SWATCH.pickerRingPx,
  height: THEME_SWATCH.pickerRingPx,
  flexShrink: 0,
  border: "none",
  borderRadius: "50%",
  cursor: "pointer",
  background: customAccentConicBorderGradient(theme),
  boxShadow: $selected ? selectionCircleShadow(theme) : "none",
  transition: "box-shadow 0.15s ease, transform 0.15s ease",
  "&:hover": { transform: "scale(1.04)" },
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

export const ThemeColorPickerInner = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  background: customAccentConicBorderGradient(theme),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.black, 0.18)}`,
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    background: `radial-gradient(circle at 50% 42%, ${alpha(theme.palette.common.white, 0.16)} 0%, ${alpha(
      theme.palette.common.black,
      0.42,
    )} 100%)`,
    pointerEvents: "none",
  },
}));

export const ThemePaletteIcon = styled(PaletteOutlined)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  fontSize: THEME_SWATCH.pickerIconPx,
  display: "block",
  lineHeight: 0,
  color: theme.palette.common.white,
  filter: [
    `drop-shadow(0 1px 2px ${alpha(theme.palette.common.black, 0.55)})`,
    `drop-shadow(0 0 6px ${alpha(theme.palette.common.black, 0.35)})`,
  ].join(" "),
}));

// —— Accent picker popover ———————————————————————————————————————————————————

export const ThemeAccentPopoverPaper = styled(Paper)(({ theme }) => {
  const d = appTokens(theme).dashboard;
  return {
    marginTop: theme.spacing(1),
    padding: theme.spacing(2),
    minWidth: 280,
    maxWidth: 320,
    borderRadius: "14px",
    border: `1px solid ${d.cardBorder}`,
    background: d.menuSurfaceBg,
    boxShadow: d.mobileSearchBarShadow,
  };
});

export const ThemeAccentPopoverTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: appTokens(theme).text.primary,
  marginBottom: theme.spacing(1),
}));

export const ThemeAccentPopoverHelp = styled(Typography)(({ theme }) => ({
  color: appTokens(theme).dashboard.textMuted,
  marginBottom: theme.spacing(2),
  display: "block",
}));

export const ThemeAccentPopoverFieldsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const ThemeSpectrumLabel = styled("label")(({ theme }) => ({
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(0.75),
  cursor: "pointer",
}));

export const ThemeSpectrumRing = styled("span")(({ theme }) => {
  const d = appTokens(theme).dashboard;
  return {
    width: THEME_SWATCH.popoverSpectrumPx,
    height: THEME_SWATCH.popoverSpectrumPx,
    borderRadius: "50%",
    border: `2px solid ${d.cardBorder}`,
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.06)}`,
  };
});

export const ThemeSpectrumInput = styled("input")({
  width: "160%",
  height: "160%",
  margin: "-30%",
  padding: 0,
  border: "none",
  cursor: "pointer",
});

export const ThemeSpectrumCaption = styled(Typography)(({ theme }) => ({
  color: appTokens(theme).dashboard.textMuted,
}));

export const ThemeAccentHexField = styled(TextField)(({ theme }) => {
  const app = appTokens(theme);
  return {
    minWidth: 140,
    "& .MuiOutlinedInput-root": {
      color: app.text.primary,
    },
    "& .MuiInputLabel-root": {
      color: app.dashboard.textMuted,
    },
  };
});

export const ThemeAccentPopoverDoneButton = styled(Button)(({ theme }) => ({
  ...gradientPrimaryButtonCss(theme),
  width: "100%",
}));
