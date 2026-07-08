import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { pageWrapper } from "@/app/dashboard/companies/overview.styles";

export const contractsPageWrapper: SxProps<Theme> = {
  ...pageWrapper,
  maxWidth: 1200,
};

export const contractsSectionCardSx: SxProps<Theme> = {
  p: { xs: 2, md: 2.5 },
  mb: 2,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const contractsPeriodBannerSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1.5,
    p: 1.5,
    borderRadius: "12px",
    border: `1px solid ${app.dashboard.cardBorder}`,
    bgcolor: alpha(app.dashboard.accentBlue, theme.palette.mode === "light" ? 0.06 : 0.12),
  };
};

export const contractsLimitPanelSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    p: 1.75,
    borderRadius: "12px",
    border: `1px solid ${app.dashboard.cardBorder}`,
    bgcolor: app.dashboard.overlayLight,
    display: "flex",
    flexDirection: "column",
    gap: 1.25,
  };
};

export const contractsInvoiceRuleSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    p: 1.25,
    borderRadius: "10px",
    border: `1px dashed ${app.dashboard.cardBorder}`,
    bgcolor: alpha(app.dashboard.accentPurple, theme.palette.mode === "light" ? 0.05 : 0.1),
  };
};

export const contractsExistingInvoiceSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    p: 1.25,
    borderRadius: "10px",
    border: `1px solid ${alpha(app.dashboard.accentOrange, 0.35)}`,
    bgcolor: alpha(app.dashboard.accentOrange, 0.1),
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1,
  };
};
