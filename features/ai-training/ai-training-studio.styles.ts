import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import type { AppTheme } from "@/theme/theme";
import { dashboardCardSurfaceProps, dashboardSolidSurface } from "@/features/chat-operations/styles/chat-semantic";
import { studioColors } from "./ai-training-studio.tokens";

function dash(theme: Theme) {
  return (theme as AppTheme).app.dashboard;
}

/** Shared pill toggle chrome for studio header tabs. */
export const aiTrainingStudioToggleGroupSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const c = studioColors(theme as AppTheme);
  const isLight = theme.palette.mode === "light";
  return {
    bgcolor: alpha(d.menuSurfaceBg ?? d.pillBg, isLight ? 0.5 : 0.38),
    borderRadius: 2,
    border: `1px solid ${alpha(d.cardBorder, isLight ? 0.45 : 0.38)}`,
    flexShrink: 0,
    "& .MuiToggleButton-root": {
      border: "none",
      px: 1.5,
      py: 0.65,
      textTransform: "none",
      fontSize: 12,
      fontWeight: 600,
      color: c.textSecondary,
      gap: 0.5,
      lineHeight: 1.2,
      "&.Mui-selected": {
        bgcolor: isLight
          ? alpha(theme.app.text.primary, 0.08)
          : alpha(d.overlayLight ?? "#ffffff", 0.14),
        color: c.text,
        boxShadow: isLight ? "none" : `inset 0 0 0 1px ${alpha(d.cardBorder, 0.35)}`,
        "&:hover": {
          bgcolor: isLight
            ? alpha(theme.app.text.primary, 0.11)
            : alpha(d.overlayLight ?? "#ffffff", 0.18),
        },
      },
      "&:hover": {
        bgcolor: alpha(d.overlayLight ?? "#ffffff", isLight ? 0.06 : 0.08),
      },
    },
  };
};

/** Fills dashboard main column — no negative bleed, no page scroll. */
export const aiTrainingStudioPageWrapper: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  m: 0,
  p: 0,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  height: "100%",
  minWidth: 0,
  overflow: "hidden",
};

/** Single card shell matching chat-ops / dashboard glass surface. */
export const aiTrainingStudioShell: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const opacity = theme.palette.mode === "light" ? 0.92 : 0.88;
  return {
    flex: 1,
    minHeight: 0,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: { xs: 0, md: "9.32px" },
    border: { xs: "none", md: `1px solid ${alpha(d.cardBorder, 0.35)}` },
    ...dashboardCardSurfaceProps(theme, opacity),
    boxShadow: d.cardGlassShadow ?? "inset 0 1px 0 rgba(255,255,255,0.06)",
  };
};

export const aiTrainingStudioToolbarRow: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: { xs: 0.75, sm: 1 },
    flexWrap: "wrap",
    rowGap: 0.75,
    px: { xs: 1.25, sm: 2 },
    py: { xs: 1, sm: 1.25 },
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.35)}`,
    bgcolor: alpha(d.menuSurfaceBg ?? d.pillBg, theme.palette.mode === "light" ? 0.5 : 0.35),
  };
};

export const aiTrainingStudioToolbarLeadingSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  flexShrink: 0,
  minWidth: 0,
};

export const aiTrainingStudioCanvasArea: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const isLight = theme.palette.mode === "light";
  return {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    minHeight: 0,
    overflow: "hidden",
    ...dashboardCardSurfaceProps(theme, isLight ? 0.55 : 0.35),
    borderTop: `1px solid ${alpha(d.cardBorder, isLight ? 0.25 : 0.35)}`,
  };
};

export const aiTrainingStudioGridBg = (
  theme: Theme,
  zoom: number,
  pan: { x: number; y: number },
): SystemStyleObject<Theme> => {
  const d = dash(theme);
  const isLight = theme.palette.mode === "light";
  const dot = alpha(d.cardBorder, isLight ? 0.45 : 0.22);
  return {
    backgroundColor: isLight
      ? alpha(dashboardSolidSurface(theme), 0.35)
      : alpha(d.overlayLight ?? "#ffffff", 0.04),
    backgroundImage: `linear-gradient(${dot} 1px, transparent 1px), linear-gradient(90deg, ${dot} 1px, transparent 1px)`,
    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
    backgroundPosition: `${pan.x}px ${pan.y}px`,
  };
};

/** Slide-over blocks panel — matches dashboard card chrome. */
export const aiTrainingFlowBlocksPanelPaper: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const isLight = theme.palette.mode === "light";
  return {
    width: 236,
    maxWidth: "85vw",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRight: `1px solid ${alpha(d.cardBorder, 0.4)}`,
    boxShadow: isLight ? "4px 0 24px rgba(15,23,42,0.08)" : d.cardGlassShadow,
    ...dashboardCardSurfaceProps(theme, isLight ? 0.98 : 0.94),
  };
};

export const aiTrainingStudioToolCluster: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const isLight = theme.palette.mode === "light";
  return {
    display: "flex",
    gap: 0.15,
    alignItems: "center",
    px: 0.35,
    py: 0.2,
    borderRadius: 2,
    border: `1px solid ${alpha(d.cardBorder, isLight ? 0.4 : 0.32)}`,
    bgcolor: alpha(d.menuSurfaceBg ?? d.pillBg, isLight ? 0.45 : 0.32),
    flexShrink: 0,
    "& .MuiIconButton-root": {
      borderRadius: 1.25,
      p: 0.65,
      "&:hover": {
        bgcolor: alpha(d.overlayLight ?? "#ffffff", isLight ? 0.08 : 0.1),
      },
    },
  };
};

export const aiTrainingSettingsDrawerPaper: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    width: { xs: "100%", sm: 420 },
    maxWidth: "100vw",
    display: "flex",
    flexDirection: "column",
    ...dashboardCardSurfaceProps(theme, theme.palette.mode === "light" ? 0.96 : 0.94),
    borderLeft: `1px solid ${alpha(d.cardBorder, 0.45)}`,
    boxShadow: theme.palette.mode === "light" ? "0 0 40px rgba(15,23,42,0.12)" : d.cardGlassShadow,
  };
};

export const aiTrainingSettingsDrawerHeader: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    flexShrink: 0,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 1,
    px: 2,
    py: 1.75,
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.35)}`,
    bgcolor: alpha(d.menuSurfaceBg ?? d.pillBg, theme.palette.mode === "light" ? 0.55 : 0.4),
  };
};

export const aiTrainingSettingsDrawerBody: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  overflow: "auto",
  px: 2,
  py: 2,
};

export const aiTrainingSettingsFieldSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const isLight = theme.palette.mode === "light";
  const text = isLight ? theme.app.text.primary : d.white95;
  const fill = isLight
    ? theme.palette.background.paper
    : alpha(d.pillBg, 0.75);
  return {
    "& label": {
      color: `${text} !important`,
      fontWeight: 600,
      fontSize: "14px !important",
    },
    "& .MuiOutlinedInput-root": {
      bgcolor: fill,
      borderRadius: "10px",
      "&::before": {
        backgroundColor: alpha(d.cardBorder, 0.55),
      },
    },
    "& .MuiOutlinedInput-root input, & .MuiOutlinedInput-root textarea": {
      color: text,
      fontSize: 14,
      lineHeight: 1.45,
    },
    "& .MuiOutlinedInput-root input::placeholder, & .MuiOutlinedInput-root textarea::placeholder": {
      color: d.textMuted,
      opacity: 1,
    },
    "& .MuiFormHelperText-root": {
      color: `${d.textMuted} !important`,
      fontSize: 12,
      lineHeight: 1.4,
    },
  };
};

export const aiTrainingSettingsSliderSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    color: d.accentBlue,
    height: 6,
    "& .MuiSlider-thumb": {
      width: 16,
      height: 16,
      bgcolor: d.white95,
      border: `2px solid ${d.accentBlue}`,
    },
    "& .MuiSlider-track": {
      bgcolor: d.accentBlue,
      border: "none",
    },
    "& .MuiSlider-rail": {
      bgcolor: alpha(d.cardBorder, 0.55),
      opacity: 1,
    },
    "& .MuiSlider-valueLabel": {
      bgcolor: d.accentBlue,
      color: d.white95,
      fontSize: 11,
      fontWeight: 700,
    },
  };
};
