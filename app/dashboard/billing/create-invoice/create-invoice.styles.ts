import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const createInvoicePageWrapperSx: SxProps<Theme> = {
  maxWidth: 1600,
  mx: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 2.2,
};

export const createInvoiceHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: { xs: "stretch", sm: "center" },
  justifyContent: "space-between",
  flexDirection: { xs: "column", sm: "row" },
  gap: 1.5,
};

export const createInvoiceSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.65,
  color: (theme as AppTheme).app.dashboard.textMuted,
});

export const createInvoiceHeaderActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flexWrap: "wrap",
};

export const createInvoiceCardSx: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2, md: 2.5 },
  display: "flex",
  flexDirection: "column",
  gap: 1.75,
};

export const createInvoiceCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
};

export const createInvoiceGridThreeSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
  gap: 1.5,
  alignItems: "end",
};

export const createInvoiceGridTwoSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
  gap: 1.5,
  alignItems: "end",
};

export const createInvoiceActionsSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 1.25,
  flexWrap: "wrap",
};
