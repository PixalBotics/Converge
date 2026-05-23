import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

function dash(theme: Theme) {
  return (theme as AppTheme).app.dashboard;
}

/** Full-bleed inbox workstation (Intercom / Front style). */
export const chatOpsPageWrapper: SxProps<Theme> = {
  width: { xs: "calc(100% + 24px)", sm: "calc(100% + 32px)", md: "calc(100% + 40px)" },
  maxWidth: "none",
  mx: { xs: -1.5, sm: -2, md: -2.5 },
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: { xs: 480, lg: "calc(100vh - 10.5rem)" },
  minWidth: 0,
};

/** Single shell — glass workstation matching DashboardCard. */
export const chatOpsWorkspaceShell: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const isLight = theme.palette.mode === "light";
  const glassFill = isLight ? "rgba(255, 255, 255, 0.14)" : "rgba(8, 12, 22, 0.22)";
  return {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: { xs: 0, md: "9.32px" },
    border: { xs: "none", md: `1px solid ${alpha(d.cardBorder, 0.32)}` },
    bgcolor: glassFill,
    backgroundImage:
      "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
    backdropFilter: d.cardBackdropBlur,
    WebkitBackdropFilter: d.cardBackdropBlur,
    boxShadow: isLight ? "0 8px 32px rgba(15, 23, 42, 0.06)" : "0 12px 40px rgba(0, 0, 0, 0.28)",
  };
};

export const chatOpsInboxToolbarSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1,
    px: 2,
    py: 1.5,
    flexShrink: 0,
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.22)}`,
    bgcolor: alpha(d.headerBg, 0.45),
  };
};

export const chatOpsPaneTitleSx: SxProps<Theme> = (theme) => ({
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: (theme as AppTheme).app.text.primary,
});

export const chatOpsPaneSubtitleSx: SxProps<Theme> = (theme) => ({
  fontSize: 11,
  color: dash(theme).textMuted,
  mt: 0.25,
});

export const chatOpsAlertBannerSx = (
  tone: "info" | "muted" | "warning",
): SxProps<Theme> => (theme) => {
  const d = dash(theme);
  const accent =
    tone === "warning"
      ? theme.palette.warning.main
      : tone === "info"
        ? d.accentBlue
        : d.textMuted;
  return {
    px: 2,
    py: 1,
    flexShrink: 0,
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.22)}`,
    bgcolor: alpha(accent, tone === "muted" ? 0.06 : 0.1),
    display: "flex",
    alignItems: "center",
    gap: 1,
  };
};

export const chatOpsQueueStatChipSx = (variant: "active" | "waiting"): SxProps<Theme> => (theme) => {
  const d = dash(theme);
  const accent = variant === "waiting" ? d.accentOrange : d.accentBlue;
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.75,
    px: 1.25,
    py: 0.45,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    color: (theme as AppTheme).app.text.primary,
    border: `1px solid ${alpha(accent, 0.35)}`,
    bgcolor: alpha(accent, 0.12),
  };
};

export const chatOpsWorkspaceGrid: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const divider = alpha(d.cardBorder, 0.18);
  const paneBg = alpha(d.sidebarBg, 0.65);
  const threadBg = alpha(d.headerBg, 0.35);
  return {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      lg: "minmax(280px, 320px) minmax(0, 1fr) minmax(260px, 300px)",
    },
    flex: 1,
    minHeight: 0,
    alignItems: "stretch",
    overflow: "hidden",
    "& > [data-chat-pane]": {
      minWidth: 0,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    "& > [data-chat-pane='inbox']": {
      background: paneBg,
    },
    "& > [data-chat-pane='thread']": {
      background: `linear-gradient(180deg, ${threadBg} 0%, ${alpha(d.sidebarBg, 0.4)} 100%)`,
      borderLeft: { lg: `1px solid ${divider}` },
      borderRight: { lg: `1px solid ${divider}` },
    },
    "& > [data-chat-pane='details']": {
      background: paneBg,
      display: { xs: "none", lg: "flex" },
    },
  };
};

export const chatOpsToolbarRow: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  px: 2.5,
  py: 1.75,
  borderBottom: `1px solid ${alpha(dash(theme).cardBorder, 0.4)}`,
  flexShrink: 0,
});

/** Segmented inbox control — pill track + active segment. */
export const chatOpsInboxTabsRow: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    display: "flex",
    gap: 0.25,
    p: 0.35,
    borderRadius: 8,
    bgcolor: alpha(d.overlayLight, 0.25),
  };
};

export const chatOpsInboxTabSx = (active: boolean): SxProps<Theme> => (theme) => {
  const d = dash(theme);
  return {
    flex: 1,
    border: "none",
    borderRadius: 8,
    py: 0.7,
    px: 1,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    color: active ? (theme as AppTheme).app.text.primary : d.textMuted,
    background: active
      ? `linear-gradient(135deg, ${alpha(d.accentBlue, 0.35)} 0%, ${alpha(d.accentIndigo, 0.28)} 100%)`
      : "transparent",
    boxShadow: active ? `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.08)}` : "none",
    transition: "background-color 0.15s ease, color 0.15s ease",
    "&:hover": {
      color: (theme as AppTheme).app.text.primary,
    },
  };
};

export const chatOpsInboxSearchWrap: SxProps<Theme> = (theme) => ({
  px: 2,
  py: 1.25,
  flexShrink: 0,
  borderBottom: `1px solid ${alpha(dash(theme).cardBorder, 0.12)}`,
  "& > div": { width: "100%", minWidth: "100%" },
});

export const chatOpsInboxHeaderSx: SxProps<Theme> = (theme) => ({
  px: 2,
  pt: 1.25,
  pb: 1.25,
  flexShrink: 0,
  borderBottom: `1px solid ${alpha(dash(theme).cardBorder, 0.15)}`,
});

export const chatOpsConnectionPillSx = (connected: boolean): SxProps<Theme> => (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  px: 1.25,
  py: 0.5,
  borderRadius: "9999px",
  fontSize: 12,
  fontWeight: 600,
  border: `1px solid ${alpha(connected ? theme.palette.success.main : theme.palette.error.main, 0.35)}`,
  bgcolor: connected ? dash(theme).successTintBg : dash(theme).errorTintBg,
  color: (theme as AppTheme).app.text.primary,
});

export const chatOpsHeaderStatSx: SxProps<Theme> = (theme) => ({
  fontSize: 12,
  color: dash(theme).textMuted,
  "& strong": {
    color: (theme as AppTheme).app.text.primary,
    fontWeight: 600,
    marginLeft: 4,
  },
});

export const chatOpsDetailLabelSx: SxProps<Theme> = (theme) => ({
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: dash(theme).textMuted,
  mb: 0.5,
});

export const chatOpsDetailValueSx: SxProps<Theme> = (theme) => ({
  fontSize: 13,
  fontWeight: 500,
  color: (theme as AppTheme).app.text.primary,
  lineHeight: 1.45,
  wordBreak: "break-word",
});
