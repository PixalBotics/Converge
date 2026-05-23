import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material";
import { ICON_SIZE, iconGlyphSx } from "@/lib/design-system/icons";
import type { AppTheme } from "@/theme/theme";

/** Shared chrome for all `Button` variants — pill, padding, min width, flex + gap. */
export const baseButtonStyles: SxProps<Theme> = {
  borderRadius: "9999px",
  py: "10px",
  px: "26px",
  fontWeight: 600,
  textTransform: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  minWidth: 140,
  boxShadow: "none",
  lineHeight: 1.2,
  "& .MuiButton-startIcon, & .MuiButton-endIcon": {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 0,
    margin: 0,
  },
  "& .MuiButton-startIcon .MuiSvgIcon-root, & .MuiButton-endIcon .MuiSvgIcon-root": iconGlyphSx(
    ICON_SIZE.md,
  ) as object,
  "& .MuiSvgIcon-root, & svg": {
    display: "block",
    lineHeight: 0,
    flexShrink: 0,
  },
  "& .MuiTypography-root": {
    display: "inline-flex",
    alignItems: "center",
    lineHeight: 1.2,
  },
};

export const compactButtonMetrics: SxProps<Theme> = {
  py: "8px",
  px: "18px",
  minWidth: 112,
  gap: "6px",
  fontSize: 14,
};

export const primaryButtonStyles = (theme: Theme): SxProps<Theme> => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.app.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
});

export const secondaryButtonStyles = (theme: Theme): SxProps<Theme> => {
  const app = (theme as AppTheme).app;
  const bg = app.dashboard.pillBg;
  const bgHover = app.dashboard.pillActive;
  return {
    /** Beat MUI `contained`+`inherit` (`color: inherit`, grey `--variant-contained-*`). */
    "&&": {
      "--variant-containedBg": bg,
      "--variant-containedColor": app.text.primary,
      backgroundColor: bg,
      color: app.text.primary,
      border: `1px solid ${app.dashboard.cardBorder}`,
    },
    "&&:hover": {
      "--variant-containedBg": bgHover,
      backgroundColor: bgHover,
      borderColor: app.dashboard.overlayBorder,
    },
  };
};

export const outlinedButtonStyles = (theme: Theme): SxProps<Theme> => {
  const app = (theme as AppTheme).app;
  return {
    "&&": {
      "--variant-outlinedColor": app.text.primary,
      color: app.text.primary,
      borderColor: app.dashboard.cardBorder,
    },
    "&&:hover": {
      borderColor: app.dashboard.overlayBorder,
      backgroundColor: app.shadow.buttonHoverBg,
    },
  };
};

/** Destructive confirm (delete, remove) — `theme.app.dashboard.accentRed`, not raw MUI error overrides per screen. */
export const dangerButtonStyles = (theme: Theme): SxProps<Theme> => {
  const app = (theme as AppTheme).app;
  const red = app.dashboard.accentRed;
  const hoverBg = alpha(red, 0.88);
  return {
    /** Same as secondary: inherit contained vars would hide the red fill. */
    "&&": {
      "--variant-containedBg": red,
      "--variant-containedColor": theme.palette.common.white,
      backgroundColor: red,
      color: theme.palette.common.white,
      border: `1px solid ${alpha(red, 0.55)}`,
    },
    "&&:hover": {
      "--variant-containedBg": hoverBg,
      backgroundColor: hoverBg,
      borderColor: alpha(red, 0.72),
    },
    "&&.Mui-disabled": {
      "--variant-containedBg": alpha(red, 0.35),
      backgroundColor: alpha(red, 0.35),
      color: alpha(theme.palette.common.white, 0.72),
      borderColor: alpha(red, 0.28),
    },
  };
};

export const variantStyles = {
  primary: primaryButtonStyles,
  secondary: secondaryButtonStyles,
  outlined: outlinedButtonStyles,
  danger: dangerButtonStyles,
} as const;

/**
 * Outlined pill chip sized like default `Button` (`baseButtonStyles`) — e.g. assignment count next to Assign shift.
 */
export const pillCompanionChipSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    height: "auto",
    minHeight: 40,
    minWidth: 140,
    borderRadius: "9999px",
    py: "10px",
    px: "26px",
    boxSizing: "border-box",
    fontWeight: 600,
    lineHeight: 1.2,
    borderColor: alpha(app.dashboard.white95, 0.35),
    color: app.dashboard.white95,
    backgroundColor: "transparent",
    "& .MuiChip-label": {
      px: 0,
      py: 0,
      lineHeight: 1.2,
      whiteSpace: "nowrap",
    },
  };
};

/** Gradient fill on top of `baseButtonStyles` — use via `sx` where Add/Save needs accent gradient. */
export const gradientPrimaryButtonSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    background: app.dashboard.gradientButton,
    color: app.dashboard.gradientButtonText,
    boxShadow: "none",
    border: `1px solid ${app.dashboard.overlayBorder}`,
    "&:hover": {
      background: app.dashboard.gradientButton,
      color: app.dashboard.gradientButtonText,
      boxShadow: "none",
    },
  };
};
