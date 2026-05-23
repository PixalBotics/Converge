import type { SxProps, Theme } from "@mui/material/styles";

export const invoicePageWrapperSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const invoicePageHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 1.5,
};

export const invoiceBackLinkSx: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  color: "rgba(255,255,255,0.55)",
  fontSize: 14,
  "&:hover": { color: "#fff", textDecoration: "underline" },
};
