import type { SxProps, Theme } from "@mui/material/styles";

export const dashboardCardStyles: SxProps<Theme> = {
  background: "#FFFFFF03",
  backdropFilter: "blur(116.45703125px)",
  borderRadius: "9.32px",
  position: "relative",
  height: "100%",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    padding: "1.6px",
    borderRadius: "9.32px",
    background:
      "linear-gradient(173.83deg, rgba(255,255,255,0.4) 4.82%, rgba(255,255,255,0.0001) 38.08%, rgba(255,255,255,0.0001) 56.68%, rgba(255,255,255,0.1) 95.1%)",
    WebkitMask:
      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    pointerEvents: "none",
  },
};
