import type { Theme } from "@mui/material/styles";

export const getLabelStyles = (theme: Theme) =>
  ({
    display: "block",
    color: theme.app.text.primary,
    fontFamily: "Manrope",
    fontWeight: 500,
    fontSize: "16px",
    mb: 0.75,
  }) as const;

export const labelVariants = {
  regular: (theme: Theme) => ({
    fontFamily: "Manrope",
    fontWeight: 400,
    fontSize: "14px",
    lineHeight: "20px",
    letterSpacing: 0,
    color: theme.app.text.primary,
  }),
  mediumLarge: (theme: Theme) => ({
    fontFamily: "Manrope",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "24px",
    letterSpacing: 0,
    color: theme.app.text.primary,
  }),
  mediumSmall: (theme: Theme) => ({
    fontFamily: "Manrope",
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "20px",
    letterSpacing: 0,
    color: theme.app.text.primary,
  }),
} as const;
