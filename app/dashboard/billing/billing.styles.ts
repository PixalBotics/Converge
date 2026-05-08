import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const billingPageWrapper: SxProps<Theme> = {
  maxWidth: 1600,
  mx: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 2.2,
};

export const billingHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: { xs: "stretch", sm: "center" },
  justifyContent: "space-between",
  flexDirection: { xs: "column", sm: "row" },
  gap: 1.5,
};

export const billingSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.65,
  color: (theme as AppTheme).app.dashboard.textMuted,
});

export const billingHeaderActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flexWrap: "wrap",
  justifyContent: { xs: "flex-start", sm: "flex-end" },
};

export const billingCardSx: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2, md: 2.5 },
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const billingCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
};

export const billingFilterGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(4, minmax(0, 1fr)) auto",
  },
  gap: 1.25,
  alignItems: "end",
};

export const billingStatusPaidSx: SxProps<Theme> = (theme) => ({
  color: theme.palette.success.main,
  fontWeight: 600,
  fontSize: 13,
});

export const billingFooterRowSx: SxProps<Theme> = (theme) => ({
  mt: 1,
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "flex-start", sm: "center" },
  justifyContent: "space-between",
  gap: 1.5,
  color: (theme as AppTheme).app.dashboard.textMuted,
  fontSize: 13,
});

export const billingPaginationWrapSx: SxProps<Theme> = {
  width: { xs: "100%", sm: "auto" },
  display: "flex",
  justifyContent: "flex-end",
  alignSelf: { xs: "stretch", sm: "auto" },
};
