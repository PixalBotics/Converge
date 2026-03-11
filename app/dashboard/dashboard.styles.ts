import type { SxProps, Theme } from "@mui/material/styles";

export const dashboardText: SxProps<Theme> = {
  color: "#FFFFFF80",
  fontFamily: '"Manrope", sans-serif',
  fontWeight: 400,
  fontStyle: "normal",
  fontSize: 14,
};

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
export const last30DaysButton: SxProps<Theme> = {
  position: "relative",
  overflow: "hidden",
  textTransform: "none",
  color: "#FFFFFF",
  fontWeight: 500,
  borderRadius: "9999px",
  padding: "8px 20px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#9999994D, #33333373, #000000",
  backgroundBlendMode: "darken, luminosity, normal",
  boxShadow:
    "0px 0px 16px 0px #F2F2F2 inset, 0px 0px 3px 0px #FFFFFF80 inset, -1px -1px 0.5px -1px #FFFFFF inset, 1px 1px 0.5px -1px #FFFFFF inset, -1px -1px 0px -0.5px #262626 inset, 1px 1px 0px -0.5px #333333 inset",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: "9999px",
    background: "#FFFFFF14",
    pointerEvents: "none",
  },
  "& > span": { position: "relative", zIndex: 1 },
  "&:hover": {
    background: "#9999994D, #33333373, #000000",
    backgroundBlendMode: "darken, luminosity, normal",
    borderColor: "rgba(255,255,255,0.18)",
    boxShadow:
      "0px 0px 16px 0px #F2F2F2 inset, 0px 0px 3px 0px #FFFFFF80 inset, -1px -1px 0.5px -1px #FFFFFF inset, 1px 1px 0.5px -1px #FFFFFF inset, -1px -1px 0px -0.5px #262626 inset, 1px 1px 0px -0.5px #333333 inset",
  },
};

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
  gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" },
  gap: { xs: 1.5, sm: 2 },
  mb: 2,
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

export const revenueToggleGroup: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "53.51px",
  p: 0.5,
  background: "#16123F",
  border: "0.51px solid #FFFFFF0F",
  "& .MuiToggleButtonGroup-grouped": {
    border: "none",
    borderRadius: "53.51px",
    color: "rgba(148, 163, 184, 0.85)",
    textTransform: "none",
    padding: "6px 18px",
    fontSize: 13,
    "&:not(:first-of-type)": {
      marginLeft: 2,
    },
    "&.Mui-selected": {
      bgcolor: "#0048B70A",
      color: "#FFFFFF",
      border: "0.51px solid #D9D9D90F",
      boxShadow: "0 6px 18px rgba(15, 23, 42, 0.8)",
      "&:hover": {
        bgcolor: "#0048B70A",
      },
    },
  },
};

export const toggleButtonGroup: SxProps<Theme> = {
  mb: 2,
  "& .MuiToggleButton-root": {
    color: "rgba(255,255,255,0.6)",
    borderColor: "rgba(255,255,255,0.1)",
    textTransform: "none",
    "&.Mui-selected": {
      bgcolor: "rgba(59, 130, 246, 0.3)",
      color: "white",
      borderColor: "rgba(59, 130, 246, 0.5)",
    },
  },
};

export const toggleButtonGroupChat: SxProps<Theme> = {
  mb: 2,
  "& .MuiToggleButton-root": {
    color: "rgba(255,255,255,0.6)",
    borderColor: "rgba(255,255,255,0.1)",
    textTransform: "none",
    "&.Mui-selected": {
      bgcolor: "rgba(59, 130, 246, 0.3)",
      color: "white",
    },
  },
};

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

/** Chat Analytics: pill toggle — container #16123F, active tab #2B254D, inactive rgba(255,255,255,0.5) */
export const chatAnalyticsToggleGroup: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "53.51px",
  p: 0.5,
  background: "#16123F",
  border: "0.51px solid #FFFFFF0F",
  "& .MuiToggleButtonGroup-grouped": {
    border: "none",
    borderRadius: "53.51px",
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "none",
    padding: "6px 18px",
    fontSize: 13,
    "&:not(:first-of-type)": {
      marginLeft: 2,
    },
    "&.Mui-selected": {
      bgcolor: "#2B254D",
      color: "#FFFFFF",
      border: "0.51px solid #D9D9D90F",
      "&:hover": {
        bgcolor: "#2B254D",
      },
    },
  },
};

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
  outline: "none",
  "&:focus": { outline: "none", boxShadow: "none" },
  "&:focus-visible": { outline: "none", boxShadow: "none" },
  "& *": { outline: "none" },
  "& *:focus": { outline: "none", boxShadow: "none" },
  "& *:focus-visible": { outline: "none", boxShadow: "none" },
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

export const tableRoot: SxProps<Theme> = {
  "& .MuiTableCell-root": {
    borderColor: "rgba(255,255,255,0.08)",
  },
};

export const tableHeaderCell: SxProps<Theme> = {
  color: "rgba(255,255,255,0.8)",
  fontWeight: 600,
};

export const tableCellWhite: SxProps<Theme> = {
  color: "white",
};

export const tableCellMuted: SxProps<Theme> = {
  color: "rgba(255,255,255,0.7)",
};

export const tableActionButton: SxProps<Theme> = {
  color: "rgba(255,255,255,0.6)",
};

export const iconSize22: SxProps<Theme> = {
  fontSize: 22,
};
