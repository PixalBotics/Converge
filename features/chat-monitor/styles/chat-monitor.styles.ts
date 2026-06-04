import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  chatOpsAlertBannerSx,
  chatOpsInboxHeaderSx,
  chatOpsInboxSearchWrap,
  chatOpsInboxTabSx,
  chatOpsInboxTabsRow,
  chatOpsInboxToolbarSx,
  chatOpsPageWrapper,
  chatOpsWorkspaceShell,
} from "@/features/chat-operations/styles/chat-operations.styles";

export {
  chatOpsPageWrapper as chatMonitorPageWrapper,
  chatOpsWorkspaceShell as chatMonitorWorkspaceShell,
  chatOpsInboxToolbarSx as chatMonitorInboxToolbarSx,
  chatOpsInboxHeaderSx as chatMonitorInboxHeaderSx,
  chatOpsInboxTabsRow as chatMonitorInboxTabsRow,
  chatOpsInboxTabSx as chatMonitorInboxTabSx,
  chatOpsInboxSearchWrap as chatMonitorFilterWrap,
};

function dash(theme: Theme) {
  return (theme as AppTheme).app.dashboard;
}

/** Monitor: inbox + thread + visitor details (matches agent workstation). */
export const chatMonitorWorkspaceGrid: SxProps<Theme> = (theme) => {
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
    overflow: "hidden",
    "& > [data-monitor-pane]": {
      minWidth: 0,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    "& > [data-monitor-pane='inbox']": { background: paneBg },
    "& > [data-monitor-pane='thread']": {
      background: threadBg,
      borderLeft: { lg: `1px solid ${divider}` },
      borderRight: { lg: `1px solid ${divider}` },
    },
    "& > [data-monitor-pane='details']": {
      background: paneBg,
      display: { xs: "none", lg: "flex" },
    },
  };
};

export const chatMonitorReadOnlyBannerSx = chatOpsAlertBannerSx("info");

/** Compact team-agent picker above the monitor grid. */
export const chatMonitorAgentTableWrapSx: SxProps<Theme> = {
  flexShrink: 0,
  maxHeight: 220,
  overflow: "auto",
  minHeight: 0,
};

export const chatMonitorToolbarRowSx: SxProps<Theme> = {
  flexShrink: 0,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  px: { xs: 0.5, md: 1 },
  pt: 0.5,
  pb: 0.25,
};
