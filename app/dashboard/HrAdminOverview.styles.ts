import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  pageWrapper,
  overviewHeader,
  last30DaysButton,
  grid4,
  overviewHeaderDropdownWrap,
  revenueHeaderRow,
  revenueTitleRow,
  tableUserCellBox,
  tableAvatar,
  tableAvatarIcon,
  liveOverviewHeaderIconBox,
  starIconYellow,
  gridAgentLiveOverview,
  cardAgentPerformance,
  cardLiveOverview,
  cardPadding,
} from "./dashboard.styles";

export {
  pageWrapper,
  overviewHeader,
  last30DaysButton,
  grid4,
  overviewHeaderDropdownWrap,
  revenueHeaderRow,
  revenueTitleRow,
  tableUserCellBox,
  tableAvatar,
  tableAvatarIcon,
  liveOverviewHeaderIconBox,
  starIconYellow,
  gridAgentLiveOverview,
  cardAgentPerformance,
  cardLiveOverview,
  cardPadding,
};

export const gridAgentLiveOverviewHr: SxProps<Theme> = {
  ...gridAgentLiveOverview,
  gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
};

export const getAgentTableSx = (theme: AppTheme): SxProps<Theme> => ({
  "& .MuiTableCell-root": { borderColor: theme.app.dashboard.cardBorder },
  "& thead .MuiTableCell-root": {
    borderBottom: `0.5px solid ${theme.app.dashboard.tableDivider}`,
    color: theme.palette.text.secondary,
    fontSize: 13,
  },
});

export const getViewAllAgentLink = (theme: AppTheme): SxProps<Theme> => ({
  color: theme.app.dashboard.accentCyan,
  fontSize: 14,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  "&:hover": { textDecoration: "underline" },
});

export const qaHeaderRow: SxProps<Theme> = {
  ...revenueTitleRow,
  mb: 3,
};

export const qaHeaderIconCircle: SxProps<Theme> = {
  ...liveOverviewHeaderIconBox,
  borderRadius: "50%",
};

export const departmentRatingCard: SxProps<Theme> = {
  p: 2,
  mb: 3,
  height: "auto",
};

export const departmentRatingRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 1,
};

export const trendArrowBox: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  mr: 0.5,
};

export const ratingValueBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
};

export const getRatingValuePurple = (theme: AppTheme): SxProps<Theme> => ({
  color: theme.app.dashboard.accentViolet,
});

export const excellentPoorGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 2,
  mb: 3,
};

export const excellentPoorCard: SxProps<Theme> = {
  p: 2,
  minHeight: 132,
  height: "auto",
};

export const starExcellent: SxProps<Theme> = {
  ...starIconYellow,
  mb: 0.5,
  display: "block",
};

export const getStarPoor = (theme: AppTheme): SxProps<Theme> => ({
  fontSize: 18,
  color: theme.app.dashboard.accentRed,
  mb: 0.5,
  display: "block",
});

export const getRatingNumberBlue = (theme: AppTheme): SxProps<Theme> => ({
  color: theme.app.dashboard.accentBlue,
  my: 0.5,
});

export const trendRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
};

export const reviewPowerButton: SxProps<Theme> = {
  borderRadius: "9999px",
  py: 3.2,
  px: 3,
  color: "white",
};

export const liveMonitorHeaderRow: SxProps<Theme> = revenueHeaderRow;

export const getMonitorAllButton = (theme: AppTheme): SxProps<Theme> => ({
  borderRadius: "9999px",
  px: 2.5,
  borderColor: theme.app.dashboard.overlayBorder,
  color: theme.app.text.primary,
});

export const liveChatGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
  gap: 2,
  maxHeight: 420,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": { display: "none" },
};

export const getLiveChatCard = (theme: AppTheme): SxProps<Theme> => ({
  p: 2,
  borderRadius: 2,
  backgroundColor: theme.app.dashboard.liveChat.cardGlass,
  backdropFilter: "blur(4.658280849456787px)",
  WebkitBackdropFilter: "blur(4.658280849456787px)",
});

export const liveChatTopRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  gap: 2,
  mb: 1.5,
};

export const liveChatCustomerBlock: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  flex: 1,
  minWidth: 0,
};

export const getLiveChatAvatar = (theme: AppTheme): SxProps<Theme> => ({
  width: 40,
  height: 40,
  bgcolor: theme.app.dashboard.liveChat.avatarBg,
  flexShrink: 0,
});

export const liveChatCustomerName: SxProps<Theme> = {
  lineHeight: 1.3,
};

export const getLiveChatDivider = (theme: AppTheme): SxProps<Theme> => ({
  width: "2px",
  alignSelf: "stretch",
  bgcolor: theme.app.dashboard.liveChat.avatarBg,
  borderRadius: 1,
  flexShrink: 0,
});

export const liveChatAssignedBlock: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  flex: 1,
  minWidth: 0,
};

export const getLiveChatMessageBlock = (theme: AppTheme): SxProps<Theme> => ({
  borderRadius: "8px",
  bgcolor: theme.app.dashboard.liveChat.messageBg,
  p: 1.5,
  mb: 1.5,
});

export const getLiveChatMessageText = (theme: AppTheme): SxProps<Theme> => ({
  color: theme.app.dashboard.liveChat.messageText,
  display: "block",
  lineHeight: 1.5,
});

export const getLiveChatBottomRow = (theme: AppTheme): SxProps<Theme> => ({
  pt: 1.5,
  borderTop: `1px solid ${theme.app.dashboard.overlayMedium}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 1,
});

export const liveChatStatusGroup: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};

export const liveChatStatusItem: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
};

export const liveChatStatusDot: SxProps<Theme> = {
  width: 8,
  height: 8,
  borderRadius: "50%",
};

export const getQuickViewLink = (theme: AppTheme): SxProps<Theme> => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  color: theme.app.text.primary,
  fontSize: 13,
  textDecoration: "underline",
  "&:hover": { color: theme.app.dashboard.white95 },
});

export const activeChatBarsRoot: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.25,
};

export const activeChatBarsLabel: SxProps<Theme> = {
  mr: 0.5,
  fontSize: 13,
};

export const statusCell: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
};

export const viewAllAgentWrap: SxProps<Theme> = {
  textAlign: "center",
  mt: 2,
};

export const agentLiveHeaderRow: SxProps<Theme> = {
  ...revenueHeaderRow,
  mb: 1.5,
};
