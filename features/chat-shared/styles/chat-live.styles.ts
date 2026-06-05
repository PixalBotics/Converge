import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { pageWrapper } from "@/app/dashboard/companies/overview.styles";
import { rolesPageWrapper } from "@/app/dashboard/roles/roles.styles";

function dash(theme: Theme) {
  return (theme as AppTheme).app.dashboard;
}

/** Same inset as billing / my-attendance — centered column inside `<main>`. */
export const chatLiveAdminPageInsetSx: SxProps<Theme> = [pageWrapper, rolesPageWrapper];

export const chatLivePageStackSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  maxHeight: "100%",
  minWidth: 0,
  overflow: "hidden",
  gap: { xs: 1.25, md: 1.75 },
};

/** Agent inbox — no extra page header gap; grid starts immediately. */
export const chatLiveAgentStackSx: SxProps<Theme> = {
  ...chatLivePageStackSx,
  gap: 0,
  flex: 1,
  minHeight: 0,
  height: "100%",
};

export const chatLiveFilterCardSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const isLight = theme.palette.mode === "light";
  const glassFill = isLight ? "rgba(255, 255, 255, 0.16)" : "rgba(8, 12, 22, 0.18)";
  const resolvedBlur = d.cardBackdropBlur;
  return {
    flexShrink: 0,
    borderRadius: { xs: 8, md: 10 },
    border: `1px solid ${alpha(d.cardBorder, 0.35)}`,
    backgroundColor: glassFill,
    backgroundImage:
      "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
    backdropFilter: resolvedBlur,
    WebkitBackdropFilter: resolvedBlur,
    px: { xs: 1.5, md: 2 },
    py: { xs: 1.25, md: 1.5 },
  };
};

/** Wraps `ChatLiveModeTabs` inside a `DashboardCard`. */
export const chatLiveModeTabsCardSx: SxProps<Theme> = {
  flexShrink: 0,
  p: { xs: 1, md: 1.25 },
  height: "auto",
  minHeight: 0,
};

export const chatLiveFilterGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    md: "repeat(3, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr))",
  },
  gap: 1.25,
  alignItems: "end",
};

export const chatLiveNavStripSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: { xs: 0.5, md: 0.75 },
  width: "100%",
};

/** Same row height as Filter + queue stat pills on chat monitor / ops toolbars. */
export const chatLiveToolbarControlHeightPx = 44;

/** Filter button row on chat workstation toolbars (inbox / monitor). */
export const chatLiveToolbarFilterRowSx: SxProps<Theme> = {
  display: "inline-flex",
  flexShrink: 0,
  alignItems: "center",
  "& .MuiButton-root": {
    height: chatLiveToolbarControlHeightPx,
    minHeight: chatLiveToolbarControlHeightPx,
    py: 0,
    boxSizing: "border-box",
  },
};

export const chatLiveNavRowSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  alignItems: "center",
  mt: 1,
};

export const chatLiveNavLinkSx =
  (active: boolean): SxProps<Theme> =>
  (theme) => {
    const d = dash(theme);
    return {
      fontSize: 16,
      fontWeight: active ? 600 : 500,
      color: active ? (theme as AppTheme).app.text.primary : d.textMuted,
      textDecoration: "none",
      px: 0.25,
      py: 0.35,
      whiteSpace: "nowrap",
      borderBottom: active ? `2px solid ${d.accentBlue}` : "2px solid transparent",
      transition: "color 0.15s ease, border-color 0.15s ease",
      "&:hover": {
        color: (theme as AppTheme).app.text.primary,
      },
    };
  };

/** Flat page chrome — no nested glass card. */
export const chatLiveHeaderCardSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    flexShrink: 0,
    pb: 1.25,
    mb: 0.25,
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.22)}`,
  };
};

export const chatLiveViewSwitchRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-end",
  gap: 2,
  mt: 1.25,
  flexShrink: 0,
};

/** Top row on agent/monitor workstations (view tabs + filter + queue stats). */
export const chatLiveWorkstationToolbarRowSx: SxProps<Theme> = {
  flexShrink: 0,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  // px: { xs: 0.5, md: 1 },
  // pt: { xs: 1.25, md: 1.75 },
  pb: 0.25,
  mb: { xs: 1.25, md: 1.75 },
};

export const chatLiveViewSwitchBtnSx =
  (active: boolean): SxProps<Theme> =>
  (theme) => {
    const d = dash(theme);
    return {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 16,
      fontWeight: active ? 600 : 500,
      color: active ? (theme as AppTheme).app.text.primary : d.textMuted,
      pb: 0.75,
      mb: "-1px",
      borderBottom: active ? `2px solid ${d.accentBlue}` : "2px solid transparent",
      transition: "color 0.15s ease, border-color 0.15s ease",
      "&:hover": {
        color: (theme as AppTheme).app.text.primary,
      },
    };
  };

export const chatLiveScopeChipSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    display: "inline-flex",
    alignItems: "center",
    px: 1,
    py: 0.35,
    borderRadius: "6px",
    fontSize: 11,
    fontWeight: 600,
    color: d.accentBlue,
    border: `1px solid ${alpha(d.accentBlue, 0.35)}`,
    bgcolor: alpha(d.accentBlue, 0.12),
    textTransform: "capitalize",
  };
};

export const chatLiveQueueStatPillSx = (
  variant: "active" | "waiting" | "closed",
): SxProps<Theme> => (theme) => {
  const d = dash(theme);
  const accent =
    variant === "waiting"
      ? d.accentOrange
      : variant === "closed"
        ? d.textMuted
        : d.accentBlue;
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0.5,
    height: chatLiveToolbarControlHeightPx,
    minHeight: chatLiveToolbarControlHeightPx,
    boxSizing: "border-box",
    px: 1.5,
    py: 0,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.2,
    color: (theme as AppTheme).app.text.primary,
    border: `1px solid ${alpha(accent, 0.35)}`,
    bgcolor: alpha(accent, 0.12),
  };
};

/** Sentence-case tabs on chat configure pages (involvement, widget settings). */
export const chatConfigurePageTabsSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    flexShrink: 0,
    minHeight: 40,
    "& .MuiTabs-indicator": {
      backgroundColor: d.accentBlue,
      height: 2,
      borderRadius: 1,
    },
    "& .MuiTab-root": {
      textTransform: "none",
      fontSize: 16,
      fontWeight: 500,
      letterSpacing: 0,
      minHeight: 40,
      py: 1,
      color: d.textMuted,
      "&.Mui-selected": {
        color: (theme as AppTheme).app.text.primary,
        fontWeight: 600,
      },
    },
  };
};

export const chatLivePaneHeaderSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    px: 1.75,
    py: 1,
    flexShrink: 0,
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.22)}`,
    bgcolor: alpha(d.headerBg, 0.5),
  };
};
