import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const phoneNumberSetupHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: { xs: "stretch", sm: "center" },
  justifyContent: "space-between",
  flexDirection: { xs: "column", sm: "row" },
  gap: 1.5,
};

export const phoneNumberSetupSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.65,
  color: (theme as AppTheme).app.dashboard.textMuted,
});

export const phoneNumberSetupAddButtonSx: SxProps<Theme> = {
  minWidth: 166,
  whiteSpace: "nowrap",
  width: { xs: "100%", sm: "auto" },
};

export const phoneNumberSetupCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
};

export const phoneNumberSetupFilterGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(3, minmax(0, 1fr)) auto",
  },
  gap: 1.5,
  alignItems: "end",
};

export const phoneNumberSetupStatusApprovedSx: SxProps<Theme> = (theme) => ({
  color: theme.palette.success.main,
  fontWeight: 600,
  fontSize: 13,
});
