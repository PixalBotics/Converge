import type { SxProps, Theme } from "@mui/material";

export const baseButtonStyles: SxProps<Theme> = {
  borderRadius: 2,
  py: 1.5,
  fontWeight: 600,
  textTransform: "none",
};

export const primaryButtonStyles = (theme: Theme): SxProps<Theme> => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.app.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
});

export const secondaryButtonStyles = (theme: Theme): SxProps<Theme> => ({
  backgroundColor: "grey.700",
  color: theme.app.text.primary,
  "&:hover": {
    backgroundColor: "grey.800",
  },
});

export const outlinedButtonStyles = (theme: Theme): SxProps<Theme> => ({
  borderColor: "grey.500",
  color: "grey.200",
  "&:hover": {
    borderColor: "grey.400",
    backgroundColor: theme.app.shadow.buttonHoverBg,
  },
});

export const variantStyles = {
  primary: primaryButtonStyles,
  secondary: secondaryButtonStyles,
  outlined: outlinedButtonStyles,
} as const;
