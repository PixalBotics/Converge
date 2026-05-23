import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { cardPadding, pageWrapper } from "../dashboard.styles";

export const billingPageWrapper: SxProps<Theme> = {
  ...pageWrapper,
  width: "100%",
  maxWidth: 1600,
  mx: "auto",
};

export const billingPageHeader: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", lg: "row" },
  alignItems: { xs: "stretch", lg: "flex-start" },
  justifyContent: "space-between",
  gap: 2,
  mb: 2.5,
};

export const billingSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.75,
  color: (theme as AppTheme).app.dashboard.textMuted,
  maxWidth: 720,
});

export const billingHeaderActionsSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: { xs: "stretch", lg: "flex-end" },
  gap: 1.25,
};

export const billingPreviewLinksSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  justifyContent: { xs: "flex-start", lg: "flex-end" },
};

export const billingPreviewLinkSx: SxProps<Theme> = (theme) => ({
  fontSize: 13,
  fontWeight: 600,
  color: (theme as AppTheme).app.dashboard.textMuted,
  textDecoration: "none",
  px: 1.25,
  py: 0.5,
  borderRadius: "9999px",
  border: `1px solid ${(theme as AppTheme).app.dashboard.cardBorder}`,
  "&:hover": {
    color: (theme as AppTheme).app.text.primary,
    borderColor: (theme as AppTheme).app.dashboard.overlayBorder,
  },
});

export const billingPartyToggleSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9999px",
    p: 0.5,
    bgcolor: app.dashboard.pillBg,
    border: `1px solid ${app.dashboard.cardBorder}`,
    alignSelf: { xs: "stretch", lg: "flex-end" },
    "& .MuiToggleButtonGroup-grouped": {
      border: "none",
      borderRadius: "9999px",
      textTransform: "none",
      px: 2,
      py: 0.85,
      fontSize: 14,
      fontWeight: 600,
      color: app.dashboard.textMuted,
      gap: 0.75,
      "&:not(:first-of-type)": { marginLeft: 4 },
      "&.Mui-selected": {
        bgcolor: app.dashboard.navActiveBg,
        color: app.text.primary,
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.28)",
        "&:hover": { bgcolor: app.dashboard.navActiveBg },
      },
    },
  };
};

export const billingCardSx: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mb: 2.5,
};

export const billingCardLastSx: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mb: 0,
};

export const billingCardTitleRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

export const billingSectionIconBox: SxProps<Theme> = {
  width: 40,
  height: 40,
  borderRadius: "12px",
  background: "radial-gradient(100% 100% at 50% 0%, #A855F7 0%, #312E81 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxShadow: "0 10px 30px rgba(15,23,42,0.85)",
};

export const billingFormGrid2: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
  gap: 2,
};

export const billingFormGrid3: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
  gap: 2,
};

export const billingFormGridDiscount: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 2fr)" },
  gap: 2,
};

export const billingFooterRow: SxProps<Theme> = (theme) => ({
  mt: 0.5,
  pt: 2,
  borderTop: `1px solid ${(theme as AppTheme).app.dashboard.cardBorder}`,
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 1.5,
});

export const billingSendButtonSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    minWidth: 140,
    borderRadius: "9999px",
    borderColor: app.dashboard.cardBorder,
    color: app.text.primary,
    textTransform: "none",
    fontWeight: 600,
    px: 3,
  };
};

export const billingHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: { xs: "stretch", sm: "flex-start" },
  justifyContent: "space-between",
  flexDirection: { xs: "column", sm: "row" },
  gap: 1.5,
  mb: 2.5,
};

export const billingHeaderButtonsSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  alignItems: "center",
  width: { xs: "100%", sm: "auto" },
};

export const billingCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  mb: 2,
};

export const billingFilterGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr)) auto",
  },
  gap: 1.5,
  alignItems: "end",
};

/** Apply Filter sits in the grid’s `auto` column — do not stretch to cell width. */
export const billingApplyFilterButtonSx: SxProps<Theme> = {
  minWidth: 126,
  width: "fit-content",
  maxWidth: "100%",
  justifySelf: { xs: "end", sm: "end", xl: "end" },
  gridColumn: { xs: "1", sm: "2", xl: "auto" },
};

export const billingFooterRowSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "flex-start", sm: "center" },
  justifyContent: "space-between",
  gap: 1.5,
  mt: 2,
  pt: 2,
};

export const billingPaginationWrapSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: { xs: "flex-start", sm: "flex-end" },
  width: { xs: "100%", sm: "auto" },
};

export const billingStatusPaidSx: SxProps<Theme> = (theme) => ({
  color: theme.palette.success.main,
  fontWeight: 600,
  fontSize: 13,
});

export const billingTodaysDetailButtonSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    minWidth: 132,
    borderRadius: "9999px",
    borderColor: app.dashboard.cardBorder,
    color: app.text.primary,
    textTransform: "none",
    fontWeight: 600,
    px: 2.5,
    whiteSpace: "nowrap",
    flex: { xs: "1 1 auto", sm: "0 0 auto" },
  };
};

export const billingCreateInvoiceButtonSx: SxProps<Theme> = {
  minWidth: 150,
  whiteSpace: "nowrap",
  flex: { xs: "1 1 auto", sm: "0 0 auto" },
};
