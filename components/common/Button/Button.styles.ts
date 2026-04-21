import type { SxProps, Theme } from "@mui/material";
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
  return {
    backgroundColor: app.dashboard.pillBg,
    color: app.text.primary,
    border: `1px solid ${app.dashboard.cardBorder}`,
    "&:hover": {
      backgroundColor: app.dashboard.pillActive,
      borderColor: app.dashboard.overlayBorder,
    },
  };
};

export const outlinedButtonStyles = (theme: Theme): SxProps<Theme> => {
  const app = (theme as AppTheme).app;
  return {
    borderColor: app.dashboard.cardBorder,
    color: app.text.primary,
    "&:hover": {
      borderColor: app.dashboard.overlayBorder,
      backgroundColor: app.shadow.buttonHoverBg,
    },
  };
};

export const variantStyles = {
  primary: primaryButtonStyles,
  secondary: secondaryButtonStyles,
  outlined: outlinedButtonStyles,
} as const;

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
