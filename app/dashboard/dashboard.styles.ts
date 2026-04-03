import type { SxProps, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

export const dashboardText: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  fontFamily: '"Manrope", sans-serif',
  fontWeight: 400,
  fontStyle: "normal",
  fontSize: 14,
});

export const pageWrapper: SxProps<Theme> = {
  maxWidth: 1600,
  mx: "auto",
};

export const overviewHeader: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "stretch", sm: "center" },
  justifyContent: "space-between",
  gap: { xs: 2, sm: 0 },
  mb: 3,
};

/** Last 30 Days pill button — screenshot match: blended bg, inset shadows, pill shape */
export const last30DaysButton: SxProps<Theme> = (theme) => ({
  position: "relative",
  overflow: "hidden",
  textTransform: "none",
  color: theme.palette.text.primary,
  fontWeight: 500,
  borderRadius: "9999px",
  padding: "8px 20px",
  border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
  background: "#9999994D, #33333373, #000000",
  backgroundBlendMode: "darken, luminosity, normal",
  boxShadow:
    "0px 0px 16px 0px #F2F2F2 inset, 0px 0px 3px 0px #FFFFFF80 inset, -1px -1px 0.5px -1px #FFFFFF inset, 1px 1px 0.5px -1px #FFFFFF inset, -1px -1px 0px -0.5px #262626 inset, 1px 1px 0px -0.5px #333333 inset",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: "9999px",
    background: alpha(theme.palette.text.primary, 0.08),
    pointerEvents: "none",
  },
  "& > span": { position: "relative", zIndex: 1 },
  "&:hover": {
    background: "#9999994D, #33333373, #000000",
    backgroundBlendMode: "darken, luminosity, normal",
    borderColor: alpha(theme.palette.text.primary, 0.18),
    boxShadow:
      "0px 0px 16px 0px #F2F2F2 inset, 0px 0px 3px 0px #FFFFFF80 inset, -1px -1px 0.5px -1px #FFFFFF inset, 1px 1px 0.5px -1px #FFFFFF inset, -1px -1px 0px -0.5px #262626 inset, 1px 1px 0px -0.5px #333333 inset",
  },
});

export const grid3: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
  gap: { xs: 1.5, sm: 2 },
  mb: 2,
};

export const grid3Lg: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" },
  gap: { xs: 1.5, sm: 2 },
  mb: 2,
};

export const revenueCardsColumn: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const grid2Lg: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr", lg: "1.2fr 1fr" },
  gap: { xs: 1.5, sm: 2 },
  mb: 2,
  "& > *": { minWidth: 0 },
};

export const grid4: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
  gap: { xs: 1.5, sm: 2 },
  mb: 2,
};

export const cardPadding: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2, md: 2.5 },
};

export const cardPaddingAutoHeight: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2, md: 2.5 },
  height: "auto",
};

export const chartTitle: SxProps<Theme> = {
  mb: 2,
};

export const revenueHeaderRow: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "flex-start", sm: "center" },
  justifyContent: "space-between",
  mb: 2,
  gap: 2,
};

export const revenueTitleRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

export const revenueIconBox: SxProps<Theme> = {
  width: 40,
  height: 40,
  borderRadius: "14px",
  background: "radial-gradient(100% 100% at 50% 0%, #8B5CF6 0%, #4C1D95 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.65)",
};

export const revenueToggleGroup: SxProps<Theme> = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "53.51px",
  p: 0.5,
  background: theme.app.dashboard.pillBg,
  border: `0.51px solid ${alpha(theme.palette.text.primary, 0.06)}`,
  "& .MuiToggleButtonGroup-grouped": {
    border: "none",
    borderRadius: "53.51px",
    color: theme.palette.text.secondary,
    textTransform: "none",
    padding: "6px 18px",
    fontSize: 13,
    "&:not(:first-of-type)": {
      marginLeft: 2,
    },
    "&.Mui-selected": {
      bgcolor: theme.app.dashboard.primaryTint,
      color: theme.palette.text.primary,
      border: `0.51px solid ${alpha(theme.palette.text.primary, 0.06)}`,
      boxShadow: "0 6px 18px rgba(15, 23, 42, 0.8)",
      "&:hover": {
        bgcolor: theme.app.dashboard.primaryTint,
      },
    },
  },
});

export const toggleButtonGroup: SxProps<Theme> = (theme) => ({
  mb: 2,
  "& .MuiToggleButton-root": {
    color: theme.app.dashboard.textMuted,
    borderColor: theme.app.dashboard.cardBorder,
    textTransform: "none",
    "&.Mui-selected": {
      bgcolor: theme.app.dashboard.blueTintBg,
      color: theme.palette.text.primary,
      borderColor: alpha(theme.app.dashboard.accentBlue, 0.5),
    },
  },
});

export const toggleButtonGroupChat: SxProps<Theme> = (theme) => ({
  mb: 2,
  "& .MuiToggleButton-root": {
    color: theme.app.dashboard.textMuted,
    borderColor: theme.app.dashboard.cardBorder,
    textTransform: "none",
    "&.Mui-selected": {
      bgcolor: theme.app.dashboard.blueTintBg,
      color: theme.palette.text.primary,
    },
  },
});

/** Chat Analytics: icon box same as Chats by Department (#3A3258) */
export const chatAnalyticsIconBox: SxProps<Theme> = {
  width: 40,
  height: 40,
  borderRadius: "12px",
  background: "#3A3258",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
};

/** Chat Volume card: purple circular icon (#6B46C1) per screenshot */
export const chatVolumeIconBox: SxProps<Theme> = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "#6B46C1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
};

/** Chat Analytics: pill toggle — container #16123F, active tab #2B254D, inactive rgba(255,255,255,0.5) */
export const chatAnalyticsToggleGroup: SxProps<Theme> = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "53.51px",
  p: 0.5,
  background: theme.app.dashboard.pillBg,
  border: `0.51px solid ${alpha(theme.palette.text.primary, 0.06)}`,
  "& .MuiToggleButtonGroup-grouped": {
    border: "none",
    borderRadius: "53.51px",
    color: alpha(theme.palette.text.primary, 0.55),
    textTransform: "none",
    padding: "6px 18px",
    fontSize: 13,
    "&:not(:first-of-type)": {
      marginLeft: 2,
    },
    "&.Mui-selected": {
      bgcolor: theme.app.dashboard.pillActive,
      color: theme.palette.text.primary,
      border: `0.51px solid ${alpha(theme.palette.text.primary, 0.06)}`,
      "&:hover": {
        bgcolor: theme.app.dashboard.pillActive,
      },
    },
  },
});

export const chartBox220: SxProps<Theme> = {
  height: "100%",
  borderRadius: 2,
  overflow: "hidden",
  outline: "none",
  "&:focus": { outline: "none", boxShadow: "none" },
  "&:focus-visible": { outline: "none", boxShadow: "none" },
  "& *": { outline: "none" },
  "& *:focus": { outline: "none", boxShadow: "none" },
  "& *:focus-visible": { outline: "none", boxShadow: "none" },
};

export const chartBox260: SxProps<Theme> = {
  height: "100%",
  minHeight: 260,
  outline: "none",
  "&:focus": { outline: "none", boxShadow: "none" },
  "&:focus-visible": { outline: "none", boxShadow: "none" },
  "& *": { outline: "none" },
  "& *:focus": { outline: "none", boxShadow: "none" },
  "& *:focus-visible": { outline: "none", boxShadow: "none" },
};

/** Department Performance: taller chart, less empty space at bottom */
export const chartBoxDepartmentPerformance: SxProps<Theme> = {
  ...chartBox260,
  minHeight: 320,
};

export const chartBox280: SxProps<Theme> = {
  height: "100%",
  outline: "none",
  "&:focus": { outline: "none", boxShadow: "none" },
  "&:focus-visible": { outline: "none", boxShadow: "none" },
  "& *": { outline: "none" },
  "& *:focus": { outline: "none", boxShadow: "none" },
  "& *:focus-visible": { outline: "none", boxShadow: "none" },
};

export const licenseExpiringHeader: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  mb: 1.5,
};

export const licenseExpiringIconBox: SxProps<Theme> = {
  width: 44,
  height: 44,
  borderRadius: "50%",
  bgcolor: "#EF4444",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
};

export const licenseExpiredText: SxProps<Theme> = {
  mt: 0.5,
  display: "block",
};

export const tableRoot: SxProps<Theme> = (theme) => ({
  "& .MuiTableCell-root": {
    borderColor: theme.app.dashboard.cardBorder,
  },
});

export const tableHeaderCell: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  fontWeight: 600,
});

export const tableCellWhite: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.primary,
});

export const tableCellMuted: SxProps<Theme> = (theme) => ({
  color: theme.app.dashboard.textMuted,
});

export const tableActionButton: SxProps<Theme> = (theme) => ({
  color: theme.app.text.iconMuted,
});

export const iconSize22: SxProps<Theme> = {
  fontSize: 22,
};

/** Chat Volume: summary sub-panel below chart — rounded box, two metrics; responsive: row on sm+, column on xs */
export const chatVolumeSummaryPanel: SxProps<Theme> = (theme) => ({
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: "stretch",
  borderRadius: 2,
  overflow: "hidden",
  border: "none",
  background: theme.app.dashboard.overlayLight,
  padding: "10px 0px",
});

export const chatVolumeSummaryItem: SxProps<Theme> = {
  flex: 1,
  py: 1.5,
  px: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

export const chatVolumeSummaryDivider: SxProps<Theme> = {
  width: { xs: "100%", sm: "2px" },
  height: { xs: "2px", sm: "40px" },
  minWidth: { xs: "auto", sm: "2px" },
  minHeight: { xs: "2px", sm: "auto" },
  background: { xs: "linear-gradient(90deg, transparent 0%, #7C6DE6 50%, transparent 100%)", sm: "linear-gradient(180deg, #7C6DE6 0%, #164DE2 47.12%, #050130 100%)" },
  alignSelf: "center",
};

/** Live Overview — screenshot match: header with $ icon on purple, waiting card, active list */
export const liveOverviewHeaderIconBox: SxProps<Theme> = {
  width: 40,
  height: 40,
  borderRadius: "12px",
  background: "radial-gradient(100% 100% at 50% 0%, #A78BFA 0%, #5B21B6 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#E9D5FF",
  boxShadow: "0 6px 20px rgba(91, 33, 182, 0.4)",
};

export const liveOverviewWaitingCard: SxProps<Theme> = (theme) => ({
  borderRadius: 2,
  border: "none",
  background: theme.app.dashboard.overlayLight,
  backdropFilter: "blur(8px)",
  p: 2,
  mb: 2.5,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "auto",
});

export const liveOverviewSectionTitle: SxProps<Theme> = (theme) => ({
  fontWeight: 700,
  fontSize: "1rem",
  color: theme.palette.text.primary,
  mb: 1.5,
});

export const liveOverviewChatRow: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: { xs: 1, sm: 1.5 },
  py: { xs: 1.25, sm: 1.5 },
  borderBottom: `1px solid ${theme.app.dashboard.cardBorder}`,
  "&:last-of-type": { borderBottom: "none" },
});

export const overviewHeaderDropdownWrap: SxProps<Theme> = {
  alignSelf: { xs: "flex-end" },
};

export const chartLoadingBox: SxProps<Theme> = {
  minHeight: 220,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const chartLoadingBox260: SxProps<Theme> = {
  minHeight: 260,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const chartLoadingBox280: SxProps<Theme> = {
  minHeight: 280,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const tableUserCellBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

export const tableAvatar: SxProps<Theme> = {
  width: 32,
  height: 32,
  bgcolor: "#3B82F6",
  color: "white",
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

export const tableAvatarIcon: SxProps<Theme> = {
  fontSize: 18,
};

export const activeChatsPill: SxProps<Theme> = {
  px: 1.25,
  py: 0.25,
  borderRadius: "9999px",
  bgcolor: "rgba(59, 130, 246, 0.2)",
  color: "#93C5FD",
  fontSize: "0.75rem",
  fontWeight: 500,
};

export const avgRatingBox: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
};

export const starIconYellow: SxProps<Theme> = {
  fontSize: 16,
  color: "#EAB308",
};

export const chatVolumeSummaryWrapper: SxProps<Theme> = {
  ...cardPadding,
  pt: 0,
};

export const chatVolumeSummaryLabel: SxProps<Theme> = {
  mb: 1,
};

export const chatVolumeResolvedColor: SxProps<Theme> = {
  color: "#5A67D8",
};

export const gridAgentLiveOverview: SxProps<Theme> = {
  ...grid2Lg,
  gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" },
};

export const cardAgentPerformance: SxProps<Theme> = {
  ...cardPaddingAutoHeight,
  minWidth: 0,
  overflow: "hidden",
};

export const cardLiveOverview: SxProps<Theme> = {
  ...cardPadding,
  minWidth: 0,
};

export const liveOverviewIconSize: SxProps<Theme> = {
  fontSize: 20,
};

export const waitingQueueLabel: SxProps<Theme> = {
  mb: 0.5,
};

export const waitingQueueCountRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "baseline",
  gap: 0.5,
  color: "#3B1FF5"
};

export const waitingQueueCountNumber: SxProps<Theme> = {
  color: "#3B82F6",
};

export const liveOverviewRefreshButton: SxProps<Theme> = {
  color: "#F472B6",
  p: 0.75,
};

export const liveOverviewChatList: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
};

export const liveOverviewAvatar: SxProps<Theme> = {
  width: { xs: 36, sm: 40 },
  height: { xs: 36, sm: 40 },
  bgcolor: "#3B82F6",
  color: "white",
  flexShrink: 0,
};

export const liveOverviewAvatarIcon: SxProps<Theme> = {
  fontSize: { xs: 18, sm: 20 },
};

export const liveOverviewChatContent: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
};

export const liveOverviewChatName: SxProps<Theme> = {
  mb: 0.25,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const liveOverviewChatMessage: SxProps<Theme> = {
  display: "block",
  fontSize: "0.8125rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const liveOverviewChatTime: SxProps<Theme> = {
  flexShrink: 0,
  fontSize: "0.8125rem",
};

export const revenueTitleRowMb2: SxProps<Theme> = {
  ...revenueTitleRow,
  mb: 2,
};

export const revenueIconSmall: SxProps<Theme> = (theme) => ({
  fontSize: 18,
  color: theme.app.text.iconMuted,
});