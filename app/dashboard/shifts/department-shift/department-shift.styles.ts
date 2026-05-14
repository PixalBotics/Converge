import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const departmentShiftHeaderWrapSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 2,
  mb: 0.5,
};

export const departmentShiftSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.75,
  color: (theme as AppTheme).app.dashboard.textMuted,
  maxWidth: 720,
});

export const departmentShiftCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  mb: 2.5,
};

export const departmentShiftIconSx: SxProps<Theme> = (theme) => ({
  fontSize: 20,
  color: (theme as AppTheme).app.dashboard.white95,
});

export const departmentShiftFormGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) auto" },
  gap: 2,
  mb: 0.5,
};

/** Filter popover: single column for predictable label/input alignment; nested row for reseller + parent. */
export const departmentShiftFilterPopoverStackSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  width: "100%",
};

export const departmentShiftFilterPopoverPairRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
  gap: 2,
  width: "100%",
  alignItems: "end",
};

export const departmentShiftActionsSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 1.5,
  flexWrap: "wrap",
};

export const departmentShiftFilterHintSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  whiteSpace: "normal",
  lineHeight: 1.5,
});
