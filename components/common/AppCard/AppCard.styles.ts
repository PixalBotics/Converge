import type { Theme } from "@mui/material/styles";

export const cardStyles = (theme: Theme) =>
  ({
    position: "relative",
    maxWidth: 440,
    width: "100%",
    borderRadius: "28.46px",
    background: `linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.2) 100%)`,
    backdropFilter: "blur(7.6px)",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      padding: "2.13px",
      borderRadius: "28.46px",
      background: `linear-gradient(133.31deg, ${theme.app.text.primary} 1.23%, rgba(255,255,255,0) 61.74%)`,
      WebkitMask: `linear-gradient(${theme.app.grey.inputShadowWhite} 0 0) content-box, linear-gradient(${theme.app.grey.inputShadowWhite} 0 0)`,
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      pointerEvents: "none",
    },
  }) as const;

export const cardContentStyles = {
  p: 3,
} as const;
