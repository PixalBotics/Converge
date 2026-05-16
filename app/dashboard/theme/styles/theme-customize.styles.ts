import type { SxProps, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { THEME_SWATCH } from "./theme-customize.constants";

/**
 * Theme customize page — tokenized `sx` factories and static `SxProps`.
 * Layout shells live in `theme-customize.styled.tsx` (MUI `styled`).
 */

export const themePageRootSx: SxProps<Theme> = {
  mx: "auto",
  py: { xs: 2, sm: 3 },
};

export const pageTitleSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    color: app.text.primary,
    mb: 0.5,
    fontSize: { xs: 22, sm: 26 },
  };
};

export const pageSubtitleSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  mb: 1.5,
});

export const mutedStatusLineSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  mb: 1.5,
});

export const savedLineSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  mb: 2,
});

export const sectionLabelSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    fontWeight: 700,
    color: app.text.primary,
    mb: 1.5,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    fontSize: 12,
  };
};

export const unsavedAlertSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    mb: 2.5,
    alignItems: "center",
    borderColor: alpha(app.dashboard.accentOrange, 0.55),
    bgcolor: alpha(app.dashboard.accentOrange, 0.08),
    color: app.text.primary,
    "& .MuiAlert-message": { width: "100%" },
  };
};

export const saveActionButtonSx: SxProps<Theme> = (theme) => ({
  fontWeight: 700,
  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.35 : 0.12)}`,
});

export const defaultThemeRowSx: SxProps<Theme> = {
  mb: 3,
};

export const defaultThemeSwatchesRowSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 2,
  alignItems: "flex-start",
};

/** Preserves multi-line grid (not a single flex row). */
export const colorThemesGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(3, minmax(0, 1fr))",
    sm: "repeat(5, minmax(0, 1fr))",
    md: "repeat(8, minmax(0, 1fr))",
  },
  gap: 2,
  mb: 4,
  justifyItems: "center",
};

export function customAccentConicBorderGradient(theme: Theme): string {
  const d = (theme as AppTheme).app.dashboard;
  return `conic-gradient(from 200deg, ${d.accentCyan}, ${d.accentPurple}, ${d.accentPink}, ${d.accentYellow}, ${d.accentCyan})`;
}

export function pickerTriggerSx(theme: Theme, selected: boolean): SxProps<Theme> {
  const t = theme as AppTheme;
  const primary = theme.palette.primary.main;
  return {
    position: "relative",
    m: 0,
    p: "3px",
    width: THEME_SWATCH.pickerRingPx,
    height: THEME_SWATCH.pickerRingPx,
    flexShrink: 0,
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    background: customAccentConicBorderGradient(theme),
    boxShadow: selected ? selectedRingCircleShadow(t) : "none",
    transition: "box-shadow 0.15s ease, transform 0.15s ease",
    "&:hover": { transform: "scale(1.04)" },
    "&:focus-visible": {
      outline: `2px solid ${primary}`,
      outlineOffset: 2,
    },
  };
}

export function pickerInnerSx(theme: Theme, customAccentHex: string): SxProps<Theme> {
  return {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    bgcolor: customAccentHex,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.black, 0.12)}`,
  };
}

/** Artist palette (picker trigger) — cyan ink + soft glow from `app.dashboard.accentCyan`. */
export function pickerPaletteOutlinedIconSx(theme: Theme): SxProps<Theme> {
  const app = (theme as AppTheme).app;
  const cyan = app.dashboard.accentCyan;
  return {
    fontSize: 36,
    display: "block",
    lineHeight: 0,
    color: alpha(cyan, 0.98),
    filter: [
      `drop-shadow(0 0 8px ${alpha(cyan, 0.65)})`,
      `drop-shadow(0 0 2px ${alpha(theme.palette.common.white, 0.35)})`,
      `drop-shadow(0 1px 3px ${alpha(theme.palette.common.black, 0.45)})`,
    ].join(" "),
  };
}

export function popoverPaperSlotSx(theme: Theme): SxProps<Theme> {
  const app = (theme as AppTheme).app;
  return {
    mt: 1,
    p: 2,
    minWidth: 280,
    maxWidth: 320,
    borderRadius: "14px",
    border: `1px solid ${app.dashboard.cardBorder}`,
    background: app.dashboard.menuSurfaceBg,
    boxShadow: app.dashboard.mobileSearchBarShadow,
  };
}

export const popoverTitleSx: SxProps<Theme> = (theme) => ({
  fontWeight: 700,
  color: (theme as AppTheme).app.text.primary,
  mb: 1,
});

export const popoverHelpSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  mb: 2,
  display: "block",
});

export const popoverFieldsRowSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 2,
  mb: 2,
};

export const spectrumLabelColumnSx: SxProps<Theme> = {
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 0.75,
  cursor: "pointer",
};

export function spectrumSwatchRingSx(theme: Theme): SxProps<Theme> {
  const app = (theme as AppTheme).app;
  return {
    width: THEME_SWATCH.popoverSpectrumPx,
    height: THEME_SWATCH.popoverSpectrumPx,
    borderRadius: "50%",
    border: `2px solid ${app.dashboard.cardBorder}`,
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.06)}`,
  };
}

export const spectrumCaptionSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
});

export function hexFieldSx(theme: Theme): SxProps<Theme> {
  const app = (theme as AppTheme).app;
  return {
    minWidth: 140,
    "& .MuiOutlinedInput-root": {
      color: app.text.primary,
    },
    "& .MuiInputLabel-root": {
      color: app.dashboard.textMuted,
    },
  };
}

function selectedRingCircleShadow(theme: AppTheme): string {
  const p = theme.palette.primary.main;
  return `0 0 0 2px ${alpha(theme.app.text.primary, 0.92)}, 0 0 0 4px ${alpha(p, 0.95)}, 0 6px 20px ${alpha(
    theme.palette.common.black,
    0.35,
  )}`;
}

function selectedRingTileShadow(theme: AppTheme): string {
  return `0 0 0 2px ${alpha(theme.app.text.primary, 0.88)}, 0 0 0 12px ${alpha(theme.app.text.primary, 0.14)}`;
}

export function swatchFillInnerSx(
  theme: Theme,
  opts: { shape: "tile" | "circle"; fill: { background: string } },
): SxProps<Theme> {
  const { shape, fill } = opts;
  const base: Record<string, unknown> = {
    width: "100%",
    height: "100%",
    ...fill,
  };
  if (shape === "circle") {
    base.borderRadius = "50%";
    base.boxShadow = `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.12)}`;
  } else {
    base.borderRadius = THEME_SWATCH.tileRadius;
  }
  return base as SxProps<Theme>;
}

export function swatchButtonSx(
  theme: Theme,
  opts: { shape: "tile" | "circle"; selected: boolean; compact?: boolean },
): SxProps<Theme> {
  const t = theme as AppTheme;
  const { shape, selected, compact } = opts;
  const isCircle = shape === "circle";
  const primary = theme.palette.primary.main;
  return {
    position: "relative",
    m: 0,
    p: 0,
    border: "none",
    cursor: "pointer",
    background: "transparent",
    boxShadow: selected ? (isCircle ? selectedRingCircleShadow(t) : selectedRingTileShadow(t)) : "none",
    transition: "box-shadow 0.15s ease, transform 0.15s ease",
    flexShrink: 0,
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
          overflow: "hidden",
        }
      : {
          borderRadius: THEME_SWATCH.tileRadius,
          ...(compact
            ? {
                width: THEME_SWATCH.tileCompactPx,
                height: THEME_SWATCH.tileCompactPx,
              }
            : {
                width: "100%",
                aspectRatio: "1",
                minWidth: 0,
                mx: "auto",
              }),
        }),
  };
}
