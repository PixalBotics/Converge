import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const baseButtonStyles: SxProps<Theme> = {
  borderRadius: "10px",
  py: 1.5,
  fontWeight: 600,
  textTransform: "none",
};

export const primaryButtonStyles = (theme: Theme): SxProps<Theme> => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
});

function isDark(theme: Theme) {
  return theme.palette.mode === "dark";
}

/** Neutral secondary — follows surface text, not fixed grey */
export const secondaryButtonStyles = (theme: Theme): SxProps<Theme> => {
  const ink = theme.palette.text.primary;
  return {
    backgroundColor: alpha(ink, isDark(theme) ? 0.12 : 0.08),
    color: ink,
    border: `1px solid ${alpha(ink, isDark(theme) ? 0.18 : 0.14)}`,
    "&:hover": {
      backgroundColor: alpha(ink, isDark(theme) ? 0.18 : 0.12),
      borderColor: alpha(theme.palette.primary.main, 0.35),
    },
  };
};

export const outlinedButtonStyles = (theme: Theme): SxProps<Theme> => {
  const ink = theme.palette.text.primary;
  return {
    borderColor: alpha(ink, isDark(theme) ? 0.22 : 0.2),
    color: ink,
    "&:hover": {
      borderColor: alpha(theme.palette.primary.main, 0.45),
      backgroundColor: alpha(theme.palette.primary.main, isDark(theme) ? 0.1 : 0.06),
    },
  };
};

export const variantStyles = {
  primary: primaryButtonStyles,
  secondary: secondaryButtonStyles,
  outlined: outlinedButtonStyles,
} as const;
