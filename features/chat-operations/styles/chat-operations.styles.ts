import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { hideScrollbarsSx } from "@/lib/ui/hideScrollbars";
import { dashboardCardSurfaceProps } from "./chat-semantic";

function dash(theme: Theme) {
  return (theme as AppTheme).app.dashboard;
}

/** Panel / card / queue row corners — keep sharp (3px max). */
export const CHAT_OPS_BOX_RADIUS_PX = 3;

/** Inbox workstation — full height inside main; no negative bleed (matches dashboard side gaps). */
export const chatOpsPageWrapper: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  mx: 0,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  height: "100%",
  minWidth: 0,
  overflow: "hidden",
};

/** Shared left/right inset for transcript, distribution cards, and context rail. */
export const chatOpsTranscriptInsetSx: SxProps<Theme> = {
  px: { xs: 1.5, sm: 2 },
};

export const chatOpsTranscriptInsetMxSx: SxProps<Theme> = {
  mx: { xs: 1.5, sm: 2 },
};

/** Single shell — theme card surface (works with dynamic presets). */
export const chatOpsWorkspaceShell: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const opacity = theme.palette.mode === "light" ? 0.92 : 0.88;
  return {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: { xs: 0, md: CHAT_OPS_BOX_RADIUS_PX },
    border: { xs: "none", md: `1px solid ${alpha(d.cardBorder, 0.28)}` },
    ...dashboardCardSurfaceProps(theme, opacity),
    boxShadow:
      theme.palette.mode === "light"
        ? `0 8px 32px ${alpha(d.accentIndigo, 0.06)}`
        : (d.cardGlassShadow ?? "inset 0 1px 0 rgba(255,255,255,0.06)"),
  };
};

/** Shared inner pane card — soft edges instead of hard grid dividers. */
export function chatOpsPaneSurfaceStyles(
  theme: Theme,
  variant: "inbox" | "thread" | "details",
) {
  const d = dash(theme);
  const paneBg = alpha(d.sidebarBg, variant === "thread" ? 0.42 : 0.58);
  const threadBg = alpha(d.headerBg, 0.5);
  return {
    minWidth: 0,
    minHeight: 0,
    height: "100%",
    maxHeight: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: { xs: 0, lg: CHAT_OPS_BOX_RADIUS_PX },
    border: {
      xs: "none",
      lg: `1px solid ${alpha(d.cardBorder, variant === "thread" ? 0.32 : 0.22)}`,
    },
    background: variant === "thread" ? threadBg : paneBg,
    ...(variant === "thread"
      ? {
          boxShadow: {
            lg: `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.04)}`,
          },
        }
      : {}),
  };
}

export const chatOpsPaneSurfaceSx = (
  variant: "inbox" | "thread" | "details",
): SxProps<Theme> => (theme) => chatOpsPaneSurfaceStyles(theme, variant);

export const chatOpsInboxToolbarSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1.25,
    px: { xs: 1.5, sm: 2 },
    py: { xs: 1.25, sm: 1.5 },
    flexShrink: 0,
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.16)}`,
    bgcolor: alpha(d.headerBg, 0.32),
  };
};

export const chatOpsBackButtonSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    flexShrink: 0,
    width: 36,
    height: 36,
    borderRadius: CHAT_OPS_BOX_RADIUS_PX,
    border: `1px solid ${alpha(d.cardBorder, 0.35)}`,
    bgcolor: alpha(d.overlayLight, 0.35),
    color: theme.app.dashboard.iconMuted,
    transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
    "&:hover": {
      bgcolor: alpha(d.accentBlue, 0.1),
      borderColor: alpha(d.accentBlue, 0.35),
      color: (theme as AppTheme).app.text.primary,
    },
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

/** Compact inbox: ~8–9 queue rows before the list scrolls. */
export const CHAT_OPS_QUEUE_VISIBLE_ROWS = 8.5;
export const CHAT_OPS_QUEUE_ROW_HEIGHT_PX = 76;
export const chatOpsQueueListMaxHeightPx = Math.round(
  CHAT_OPS_QUEUE_VISIBLE_ROWS * CHAT_OPS_QUEUE_ROW_HEIGHT_PX,
);

/** Scrollable scope / team picker — only visible when hub panel is expanded. */
export const chatOpsWorkstationChromeSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1.25,
  minHeight: 0,
};

export const chatOpsWorkstationTopBarSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 1,
    px: { xs: 1.25, sm: 1.5 },
    pt: { xs: 0.75, sm: 1 },
    pb: 0.5,
    flexShrink: 0,
  };
};

export const chatOpsHubControlBarSx =
  (expanded: boolean): SxProps<Theme> =>
  (theme) => {
    const d = dash(theme);
    return {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1,
      px: { xs: 1.25, sm: 1.5 },
      py: 1,
      flexShrink: 0,
      bgcolor: alpha(d.headerBg, expanded ? 0.38 : 0.22),
      borderBottom: expanded
        ? `1px solid ${alpha(d.cardBorder, 0.18)}`
        : "none",
      transition: "background-color 0.2s ease",
    };
  };

export const chatOpsHubToggleButtonSx =
  (expanded: boolean): SxProps<Theme> =>
  (theme) => {
    const d = dash(theme);
    const accent = theme.palette.primary.main;
    return {
      height: 36,
      minHeight: 36,
      px: 1.5,
      fontSize: 12,
      fontWeight: 600,
      borderRadius: CHAT_OPS_BOX_RADIUS_PX,
      whiteSpace: "nowrap",
      borderColor: expanded ? alpha(accent, 0.45) : alpha(d.cardBorder, 0.35),
      bgcolor: expanded ? alpha(accent, 0.12) : alpha(d.overlayLight, 0.28),
      color: (theme as AppTheme).app.text.primary,
      "&:hover": {
        borderColor: alpha(accent, 0.5),
        bgcolor: alpha(accent, 0.16),
      },
    };
  };

export const chatOpsHubPanelBodySx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    flexShrink: 0,
    maxHeight: { xs: "min(52vh, 420px)", md: "min(44vh, 380px)" },
    overflowY: "auto",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 1.25,
    px: { xs: 1.25, sm: 1.5 },
    py: 1.25,
    bgcolor: alpha(d.sidebarBg, 0.35),
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.2)}`,
    scrollbarWidth: "thin",
  };
};

export const chatOpsHubSummaryChipSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    height: 28,
    maxWidth: "100%",
    fontSize: 11,
    fontWeight: 600,
    borderRadius: CHAT_OPS_BOX_RADIUS_PX,
    bgcolor: alpha(d.overlayLight, 0.45),
    border: `1px solid ${alpha(d.cardBorder, 0.28)}`,
    color: (theme as AppTheme).app.text.primary,
    "& .MuiChip-label": { px: 0.75 },
    "& .MuiChip-icon": { color: d.accentBlue, ml: 0.75 },
  };
};

/** Chat Start focus — queue left + chat right (no visitor details column). */
export const chatOpsWorkspaceFocusGridSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    display: "grid",
    gridTemplateColumns: "minmax(0, 300px) minmax(0, 1fr)",
    gridTemplateRows: "minmax(0, 1fr)",
    gap: { xs: 0, lg: 1 },
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    width: "100%",
    height: "100%",
    maxHeight: "100%",
    alignItems: "stretch",
    overflow: "hidden",
    p: { xs: 0, lg: 1 },
    boxSizing: "border-box",
    "& > [data-chat-pane='inbox']": chatOpsPaneSurfaceStyles(theme, "inbox"),
    "& > [data-chat-pane='thread']": chatOpsPaneSurfaceStyles(theme, "thread"),
  };
};

/** Agent table inside hub panel — scrolls within the capped hub body. */
export const chatOpsAgentTableWrapSx: SxProps<Theme> = {
  flexShrink: 0,
  minHeight: 0,
  overflow: "visible",
};

export const chatOpsWorkspaceShellFocusSx: SxProps<Theme> = {
  borderRadius: 0,
  border: "none",
  width: "100%",
  maxWidth: "100%",
};

export const chatOpsWorkspaceGrid: SxProps<Theme> = (theme) => ({
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(0, 280px) minmax(0, 1fr) minmax(0, 272px)",
  },
  gridTemplateRows: "minmax(0, 1fr)",
  gap: { xs: 0, lg: 1 },
  flex: 1,
  minHeight: 0,
  height: "100%",
  maxHeight: "100%",
  alignItems: "stretch",
  overflow: "hidden",
  p: { xs: 0, lg: 1 },
  boxSizing: "border-box",
  "& > [data-chat-pane='inbox']": chatOpsPaneSurfaceStyles(theme, "inbox"),
  "& > [data-chat-pane='thread']": chatOpsPaneSurfaceStyles(theme, "thread"),
  "& > [data-chat-pane='details']": {
    ...chatOpsPaneSurfaceStyles(theme, "details"),
    display: { xs: "none", lg: "flex" },
    contain: "layout size",
  },
});

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
    gap: 0.35,
    p: 0.4,
    borderRadius: CHAT_OPS_BOX_RADIUS_PX,
    bgcolor: alpha(d.overlayLight, 0.22),
    border: `1px solid ${alpha(d.cardBorder, 0.22)}`,
    overflowX: "auto",
    flexWrap: "nowrap",
    WebkitOverflowScrolling: "touch",
    ...hideScrollbarsSx,
  };
};

export const chatOpsInboxTabSx = (active: boolean): SxProps<Theme> => (theme) => {
  const d = dash(theme);
  const accent = theme.palette.primary.main;
  return {
    flex: "1 0 auto",
    border: "none",
    borderRadius: CHAT_OPS_BOX_RADIUS_PX,
    py: 0.65,
    px: 0.85,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 10,
    fontWeight: active ? 700 : 500,
    whiteSpace: "nowrap",
    minWidth: 0,
    color: active ? (theme as AppTheme).app.text.primary : d.textMuted,
    background: active
      ? `linear-gradient(135deg, ${alpha(accent, 0.34)} 0%, ${alpha(accent, 0.16)} 100%)`
      : "transparent",
    boxShadow: active
      ? `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}`
      : "none",
    transition: "background 0.15s ease, color 0.15s ease",
    "&:hover": {
      color: (theme as AppTheme).app.text.primary,
      background: active
        ? `linear-gradient(135deg, ${alpha(accent, 0.34)} 0%, ${alpha(accent, 0.16)} 100%)`
        : alpha(accent, 0.08),
    },
  };
};

export const chatOpsInboxHeaderSx: SxProps<Theme> = (theme) => ({
  px: { xs: 1.5, sm: 2 },
  pt: 1,
  pb: 1.15,
  flexShrink: 0,
  borderBottom: `1px solid ${alpha(dash(theme).cardBorder, 0.12)}`,
});

export const chatOpsInboxSearchWrap: SxProps<Theme> = (theme) => ({
  px: { xs: 1.5, sm: 2 },
  py: 1,
  flexShrink: 0,
  borderBottom: `1px solid ${alpha(dash(theme).cardBorder, 0.1)}`,
  "& > div": { width: "100%", minWidth: 0, maxWidth: "100%" },
});

/** Status chip + agent pill on monitor/ops queue rows and transcript header. */
export const chatOpsConversationMetaChipHeight = 26;

export const chatOpsStatusChipSx: SxProps<Theme> = {
  height: chatOpsConversationMetaChipHeight,
  fontSize: 10,
  fontWeight: 600,
  "& .MuiChip-label": { px: 0.85, py: 0, lineHeight: 1.2 },
};

export const chatOpsAgentAssignPillSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    display: "inline-flex",
    alignItems: "center",
    height: chatOpsConversationMetaChipHeight,
    boxSizing: "border-box",
    px: 1,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.2,
    color: d.textMuted,
    border: `1px solid ${alpha(d.cardBorder, 0.45)}`,
    bgcolor: alpha(d.overlayLight, 0.35),
    whiteSpace: "nowrap",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
};

/** Compact agent meta on monitor transcript (matches {@link chatOpsStatusChipSx}). */
export const chatOpsAgentMetaChipSx: SxProps<Theme> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 0.5,
  height: chatOpsConversationMetaChipHeight,
  minHeight: chatOpsConversationMetaChipHeight,
  py: 0,
  px: 1,
  minWidth: 0,
};

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

/** Two-column visitor profile metadata (website, agent, chat id, time, duration). */
export const chatOpsProfileMetaGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  columnGap: 1.25,
  rowGap: 1.25,
};

export const chatOpsProfileMetaLabelSx: SxProps<Theme> = (theme) => ({
  fontSize: 13,
  fontWeight: 700,
  color: (theme as AppTheme).app.text.primary,
  lineHeight: 1.35,
});

export const chatOpsProfileMetaValueSx: SxProps<Theme> = (theme) => ({
  fontSize: 13,
  fontWeight: 400,
  color: (theme as AppTheme).app.text.primary,
  lineHeight: 1.45,
  wordBreak: "break-word",
});
