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

/** Monitor: inbox + read-only transcript (no details column). */
export const chatMonitorWorkspaceGrid: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const divider = alpha(d.cardBorder, 0.18);
  const paneBg = alpha(d.sidebarBg, 0.65);
  const threadBg = alpha(d.headerBg, 0.35);
  return {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      lg: "minmax(300px, 360px) minmax(0, 1fr)",
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
    "& > [data-monitor-pane='transcript']": {
      background: threadBg,
      borderLeft: { lg: `1px solid ${divider}` },
    },
  };
};

export const chatMonitorReadOnlyBannerSx = chatOpsAlertBannerSx("info");
