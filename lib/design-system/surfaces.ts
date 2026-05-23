import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

/**
 * Layout primitives for dashboard list cards. All visuals resolve from `theme.app`
 * so account / preset colors (MUI primary + accents) stay in sync everywhere.
 */

export const dashboardFilterSectionRootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: { xs: 1.75, sm: 2 },
  width: "100%",
  minWidth: 0,
};

export const dashboardSectionTitleRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  minWidth: 0,
};

export const dashboardFilterToolbarRowSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  flexWrap: "wrap",
  alignItems: { xs: "stretch", sm: "center" },
  gap: { xs: 1.5, sm: 1.75 },
  width: "100%",
  minWidth: 0,
};

export const dashboardFilterPrimarySlotSx: SxProps<Theme> = {
  flex: { xs: "none", sm: "1 1 200px" },
  minWidth: { xs: "100%", sm: 200 },
  maxWidth: { xs: "100%", lg: 400 },
};

export const dashboardFilterActionsRowSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: { xs: "flex-start", sm: "flex-end" },
  gap: 1.5,
  flex: { lg: "0 1 auto" },
  width: { xs: "100%", lg: "auto" },
};

/** Accent tile used beside section titles — uses preset / account gradient chrome. */
export const dashboardSectionIconBadgeSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    width: 40,
    height: 40,
    borderRadius: "12px",
    background: app.dashboard.gradientIcon,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    lineHeight: 0,
    boxShadow: "none",
    "& > *": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    "& .MuiSvgIcon-root": {
      display: "block",
      lineHeight: 0,
      margin: 0,
    },
    "& svg": { display: "block", verticalAlign: "middle" },
  };
};
