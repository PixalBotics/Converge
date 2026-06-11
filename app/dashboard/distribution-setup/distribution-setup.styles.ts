import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { dashboardSectionIconBadgeSx } from "@/lib/design-system";
import { cardPadding, pageWrapper } from "../dashboard.styles";

/** Same as `dashboardSectionIconBadgeSx`; kept for wizard shells that import from this module. */
export const distributionSetupSectionIconBox = dashboardSectionIconBadgeSx;

export const distributionSetupPageWrapper: SxProps<Theme> = {
  ...pageWrapper,
  width: "100%",
};

export const distributionSetupPageHeader: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", lg: "row" },
  alignItems: { xs: "stretch", lg: "flex-start" },
  justifyContent: "space-between",
  gap: 2,
  mb: 2.5,
};

export const distributionSetupHeaderActions: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
  justifyContent: { xs: "flex-start", lg: "flex-end" },
};

export const distributionSetupMainCardSx: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  height: "auto",
  minHeight: 0,
};

export const distributionSetupFooterRow: SxProps<Theme> = (theme) => ({
  mt: 1,
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "flex-start", sm: "center" },
  justifyContent: "space-between",
  gap: 1.5,
  color: (theme as AppTheme).app.dashboard.textMuted,
  fontSize: 13,
});

export const distributionSetupPaginationWrapper: SxProps<Theme> = {
  width: { xs: "100%", sm: "auto" },
  display: "flex",
  justifyContent: "flex-end",
  alignSelf: { xs: "stretch", sm: "auto" },
};
