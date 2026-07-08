export const typographyVariants = {
  medium: {
    fontFamily: '"Inter", "Manrope", sans-serif',
    fontWeight: 400,
    fontStyle: "normal",
    fontSize: 14,
    lineHeight: 1.45,
    letterSpacing: "0.3px",
  },
  mediumLarge: {
    fontFamily: '"Inter", "Manrope", sans-serif',
    fontWeight: 500,
    fontStyle: "normal",
    fontSize: 20,
    lineHeight: 1.3,
    letterSpacing: "0.2px",
  },
  small: {
    fontFamily: '"Inter", "Manrope", sans-serif',
    fontWeight: 400,
    fontStyle: "normal",
    fontSize: 12,
    lineHeight: 1.45,
    letterSpacing: "0.3px",
  },
  boldLarge: {
    fontFamily: '"Inter", "Manrope", sans-serif',
    fontWeight: 700,
    fontStyle: "normal",
    fontSize: 23.26,
    lineHeight: 1.25,
    letterSpacing: "0.3px",
  },
  regularLarge: {
    fontFamily: '"Inter", "Manrope", sans-serif',
    fontWeight: 400,
    fontStyle: "normal",
    fontSize: 22,
    lineHeight: 1.25,
    letterSpacing: "0.01em",
    verticalAlign: "middle",
  },
  medium16: {
    fontFamily: '"Inter", "Manrope", sans-serif',
    fontWeight: 500,
    fontStyle: "normal",
    fontSize: 16,
    lineHeight: 1.4,
    letterSpacing: "0.3px",
  },
} as const;

export type TypographyVariantKey = keyof typeof typographyVariants;
