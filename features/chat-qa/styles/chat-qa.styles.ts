import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { safeAlpha } from "@/lib/theme/safe-alpha";
import { dashboardSolidSurface } from "@/features/chat-operations/styles/chat-semantic";
import {
  chatOpsPageWrapper,
  chatOpsWorkspaceShell,
  chatOpsInboxHeaderSx,
  chatOpsInboxTabSx,
  chatOpsInboxTabsRow,
  chatOpsInboxToolbarSx,
  chatOpsInboxSearchWrap,
  chatOpsPaneTitleSx,
} from "@/features/chat-operations/styles/chat-operations.styles";

export {
  chatOpsPageWrapper as chatQaPageWrapper,
  chatOpsWorkspaceShell as chatQaWorkspaceShell,
  chatOpsInboxToolbarSx as chatQaInboxToolbarSx,
  chatOpsInboxHeaderSx as chatQaInboxHeaderSx,
  chatOpsInboxTabsRow as chatQaInboxTabsRow,
  chatOpsInboxTabSx as chatQaInboxTabSx,
  chatOpsInboxSearchWrap as chatQaFilterWrap,
  chatOpsPaneTitleSx as chatQaPaneTitleSx,
};

function dash(theme: Theme) {
  return (theme as AppTheme).app.dashboard;
}

export const chatQaWorkspaceGrid: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const divider = alpha(d.cardBorder, 0.18);
  const paneBg = alpha(d.sidebarBg, 0.65);
  const threadBg = alpha(d.headerBg, 0.35);
  const reviewBg = safeAlpha(d.liveChat.cardBg, 0.92, alpha(dashboardSolidSurface(theme), 0.92));
  return {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      lg: "minmax(280px, 320px) minmax(0, 1fr) minmax(300px, 360px)",
    },
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    "& > [data-qa-pane]": {
      minWidth: 0,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    "& > [data-qa-pane='queue']": { background: paneBg },
    "& > [data-qa-pane='transcript']": {
      background: threadBg,
      borderLeft: { lg: `1px solid ${divider}` },
    },
    "& > [data-qa-pane='review']": {
      background: reviewBg,
      borderLeft: { lg: `1px solid ${divider}` },
    },
  };
};

export const chatQaReviewBannerSx: SxProps<Theme> = (theme) => ({
  px: 2,
  py: 0.75,
  flexShrink: 0,
  borderBottom: `1px solid ${alpha(dash(theme).cardBorder, 0.35)}`,
});
