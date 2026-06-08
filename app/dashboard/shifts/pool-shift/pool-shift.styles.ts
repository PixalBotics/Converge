import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const poolShiftHeaderWrapSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 2,
};

export const poolShiftSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.75,
  color: (theme as AppTheme).app.dashboard.textMuted,
  maxWidth: 720,
});

export const poolShiftCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  mb: 2.5,
};

export const poolShiftIconSx: SxProps<Theme> = (theme) => ({
  fontSize: 20,
  color: (theme as AppTheme).app.dashboard.white95,
});

export const poolShiftFormGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
  gap: 2,
  mb: 0.5,
};

/** Filter popover: stacked fields + paired row for reseller/parent (aligned bottoms). */
export const poolShiftFilterPopoverStackSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  width: "100%",
};

export const poolShiftFilterPopoverPairRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
  gap: 2,
  width: "100%",
  alignItems: "end",
};

/** Matches `Button` `baseButtonStyles` pill (py 10px + label + border). */
const poolShiftHeaderActionHeight = 42;

export const poolShiftHeaderChipSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    height: poolShiftHeaderActionHeight,
    boxSizing: "border-box",
    borderRadius: "9999px",
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1.2,
    color: app.text.primary,
    border: `1px solid ${app.dashboard.cardBorder}`,
    bgcolor: "transparent",
    "& .MuiChip-label": {
      px: 2.25,
      py: 0,
      lineHeight: 1.2,
    },
  };
};

export const poolShiftActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 1.5,
  flexWrap: "wrap",
  "& .MuiButton-root": {
    height: poolShiftHeaderActionHeight,
    minHeight: poolShiftHeaderActionHeight,
    py: 0,
    boxSizing: "border-box",
  },
};

export const poolShiftFilterHintSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  alignSelf: "stretch",
  whiteSpace: "normal",
  lineHeight: 1.5,
});
