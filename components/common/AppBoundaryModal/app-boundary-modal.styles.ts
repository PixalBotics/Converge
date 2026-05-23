import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { dialogBackdropBackground } from "@/lib/ui/dialogBackdrop";
import { APP_BOUNDARY_Z_INDEX } from "@/lib/ui/dialogStacking";

export const appBoundaryBackdropSx: SxProps<Theme> = (theme) => ({
  position: "fixed",
  inset: 0,
  zIndex: APP_BOUNDARY_Z_INDEX,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: dialogBackdropBackground(theme),
  p: 2,
});

export const appBoundaryCardSx: SxProps<Theme> = {
  position: "relative",
  width: "100%",
  maxWidth: 460,
  height: "auto",
  minHeight: 0,
  alignSelf: "center",
  flexShrink: 0,
  p: { xs: 3, sm: 4 },
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  borderRadius: "18px",
};

export const appBoundaryIconCircleSx = (accent: string): SxProps<Theme> => (theme) => ({
  width: 88,
  height: 88,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  lineHeight: 0,
  background: `radial-gradient(ellipse 85% 85% at 50% 32%, ${alpha(accent, 0.35)} 0%, ${alpha(accent, 0.12)} 48%, transparent 72%)`,
  boxShadow: `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}`,
  "& .MuiSvgIcon-root": {
    display: "block",
    lineHeight: 0,
    fontSize: 44,
    width: 44,
    height: 44,
  },
});

export const appBoundaryActionsRowSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: "stretch",
  justifyContent: "center",
  gap: 1.5,
  width: "100%",
  mt: 2.5,
};
