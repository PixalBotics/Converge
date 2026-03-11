export const typographyVariants = {
  medium: {
    fontFamily: '"Manrope", sans-serif',
    fontWeight: 400,
    fontStyle: "normal",
    fontSize: 14,
    lineHeight: "100%",
    letterSpacing: "0.3px",
  },
  mediumLarge: {
    fontFamily: '"Manrope", sans-serif',
    fontWeight: 500,
    fontStyle: "normal",
    fontSize: 20,
    lineHeight: "120%",
    letterSpacing: "0.2px",
  },
  small: {
    fontFamily: '"Manrope", sans-serif',
    fontWeight: 400,
    fontStyle: "normal",
    fontSize: 12,
    lineHeight: "100%",
    letterSpacing: "0.3px",
  },
  boldLarge: {
    fontFamily: '"Manrope", sans-serif',
    fontWeight: 700,
    fontStyle: "normal",
    fontSize: 23.26,
    lineHeight: "100%",
    letterSpacing: "0.3px",
  },
  regularLarge: {
    fontFamily: '"Manrope", sans-serif',
    fontWeight: 400,
    fontStyle: "normal",
    fontSize: 22,
    lineHeight: "100%",
    letterSpacing: "1%",
    verticalAlign: "middle",
  },
  medium16: {
    fontFamily: '"Manrope", sans-serif',
    fontWeight: 500,
    fontStyle: "normal",
    fontSize: 16,
    lineHeight: "100%",
    letterSpacing: "0.3px",
  },
} as const;

export type TypographyVariantKey = keyof typeof typographyVariants;
