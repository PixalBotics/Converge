import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { cardPadding, pageWrapper } from "../dashboard.styles";

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

export const distributionSetupCardToolbar: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", lg: "row" },
  alignItems: { xs: "stretch", lg: "center" },
  justifyContent: "space-between",
  gap: 2,
};

export const distributionSetupCardTitleRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  minWidth: 0,
};

export const distributionSetupSectionIconBox: SxProps<Theme> = {
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

export const distributionSetupSearchRow: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "stretch", sm: "center" },
  gap: 1.5,
  width: { xs: "100%", lg: "auto" },
};

export const distributionSetupSearchFieldWrapper: SxProps<Theme> = {
  flex: 1,
  minWidth: { xs: "100%", sm: 240 },
  maxWidth: { lg: 360 },
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
