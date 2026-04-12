import type { SxProps, Theme } from "@mui/material/styles";
import { cardPadding, pageWrapper } from "../dashboard.styles";

export const distributionWizardPageWrapper: SxProps<Theme> = {
  ...pageWrapper,
  width: "100%",
};

export const distributionWizardPageHeader: SxProps<Theme> = {
  mb: 2.5,
};

export const distributionWizardCardSx: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  height: "auto",
  minHeight: 0,
};

export const distributionWizardCardFooter: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 1.5,
  mt: 1,
  flexWrap: "wrap",
};

export const distributionWizardFormGrid3: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
  gap: 2,
  alignItems: "start",
};

/** Search + Add Row on one row (card header right, beside title) */
export const distributionWizardTableToolbar: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 1.5,
  flexWrap: "nowrap",
  width: "100%",
};

export const distributionWizardTableSearchWrap: SxProps<Theme> = {
  flex: "1 1 auto",
  minWidth: 0,
  maxWidth: 400,
};
