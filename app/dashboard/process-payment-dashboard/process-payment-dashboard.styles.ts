import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const processPaymentPageWrapperSx: SxProps<Theme> = {
  maxWidth: 1600,
  mx: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 2.2,
};

export const processPaymentHeaderRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: { xs: "stretch", sm: "center" },
  justifyContent: "space-between",
  flexDirection: { xs: "column", sm: "row" },
  gap: 1.25,
};

export const processPaymentSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.65,
  color: (theme as AppTheme).app.dashboard.textMuted,
});

export const processPaymentCardSx: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2, md: 2.5 },
  display: "flex",
  flexDirection: "column",
  gap: 1.75,
};

export const processPaymentCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
};

export const processPaymentMethodGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
  gap: 1.5,
};

export const processPaymentMethodItemSx: SxProps<Theme> = (theme) => ({
  p: 1.5,
  display: "flex",
  flexDirection: "column",
  gap: 1,
});

export const processPaymentMethodTopRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

export const processPaymentMethodIconSx: SxProps<Theme> = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: "primary.main",
  color: "common.white",
};

export const processPaymentFieldsGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
  gap: 1.5,
  alignItems: "end",
};

export const processPaymentUploadBoxSx: SxProps<Theme> = (theme) => ({
  width: "100%",
  borderRadius: 1.5,
  border: `1px dashed ${alpha((theme as AppTheme).app.dashboard.accentBlue, 0.6)}`,
  minHeight: 112,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: 0.6,
  color: (theme as AppTheme).app.dashboard.textMuted,
  textAlign: "center",
});

export const processPaymentActionsSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 1.25,
  flexWrap: "wrap",
};
