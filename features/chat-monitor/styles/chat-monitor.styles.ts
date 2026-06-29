import type { SxProps, Theme } from "@mui/material/styles";
import {
  chatOpsAlertBannerSx,
  chatOpsAgentTableWrapSx,
  chatOpsInboxHeaderSx,
  chatOpsInboxSearchWrap,
  chatOpsInboxTabSx,
  chatOpsInboxTabsRow,
  chatOpsInboxToolbarSx,
  chatOpsPageWrapper,
  chatOpsPaneSurfaceSx,
  chatOpsWorkstationChromeSx,
  chatOpsWorkstationTopBarSx,
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
  chatOpsWorkstationTopBarSx as chatMonitorWorkstationTopBarSx,
  chatOpsAgentTableWrapSx as chatMonitorAgentTableWrapSx,
  chatOpsWorkstationChromeSx as chatMonitorWorkstationChromeSx,
};
/** Monitor: inbox + thread + visitor details (matches agent workstation). */
export const chatMonitorWorkspaceGrid: SxProps<Theme> = (theme) => ({
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(0, 280px) minmax(0, 1fr) minmax(0, 272px)",
  },
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
  "& > [data-monitor-pane='inbox']": chatOpsPaneSurfaceSx("inbox")(theme),
  "& > [data-monitor-pane='thread']": chatOpsPaneSurfaceSx("thread")(theme),
  "& > [data-monitor-pane='details']": {
    ...chatOpsPaneSurfaceSx("details")(theme),
    display: { xs: "none", lg: "flex" },
    contain: "layout size",
  },
});

export const chatMonitorReadOnlyBannerSx = chatOpsAlertBannerSx("info");

export { chatLiveWorkstationToolbarRowSx as chatMonitorToolbarRowSx } from "@/features/chat-shared/styles/chat-live.styles";
