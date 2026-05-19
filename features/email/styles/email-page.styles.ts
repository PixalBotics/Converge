import type { SxProps, Theme } from "@mui/material/styles";
import { cardPadding } from "@/app/dashboard/dashboard.styles";

export {
  cardTitleIconBox,
  cardTitleRow,
  footerMutedText,
  pageHeaderRow,
  pageWrapper,
} from "@/app/dashboard/companies/overview.styles";

export {
  departmentsCard,
  departmentsCardHeader,
  departmentsFooterRow,
} from "@/app/dashboard/website-assigning/website-assigning.styles";

export { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";

export const emailPageWrapper: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2.4,
  width: "100%",
  maxWidth: 1600,
  mx: "auto",
};

export const emailSectionTabs: SxProps<Theme> = (theme) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  borderBottom: `1px solid ${(theme as { app?: { dashboard?: { cardBorder?: string } } }).app?.dashboard?.cardBorder ?? "rgba(255,255,255,0.12)"}`,
  pb: 1,
  mb: 0.5,
});

export const emailCard: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const emailCardFooter: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 1.5,
  mt: 0.5,
  flexWrap: "wrap",
};

export const emailFormGrid2: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
  gap: 2,
  alignItems: "start",
};

export const emailToolbarRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flexWrap: "wrap",
  mb: 1.5,
};
