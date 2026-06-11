import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { cardPadding, pageWrapper } from "../dashboard.styles";

export const crmIntegratorPageWrapper: SxProps<Theme> = {
  ...pageWrapper,
  width: "100%",
};

export const crmIntegratorPageHeader: SxProps<Theme> = {
  mb: 2.5,
};

/** Two main panels: organization (narrow) + form configuration (wide) */
export const crmIntegratorTwoColumnGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "minmax(280px, 380px) minmax(0, 1fr)" },
  gap: 2,
  alignItems: "stretch",
};

export const crmIntegratorCardSx: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  height: "100%",
  minHeight: 0,
};

/** Form configuration: included sections + field mapping side by side */
export const crmIntegratorFormConfigGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1.2fr)" },
  gap: { xs: 3, md: 3 },
  alignItems: "start",
};

export const crmIntegratorCardTitleRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

export const crmIntegratorSectionIconBox: SxProps<Theme> = {
  width: 40,
  height: 40,
  borderRadius: "12px",
  background: "radial-gradient(100% 100% at 50% 0%, #A855F7 0%, #312E81 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxShadow: "none",
};

export const crmIntegratorFooterRow: SxProps<Theme> = (theme) => ({
  mt: "auto",
  pt: 2,
  borderTop: `1px solid ${(theme as AppTheme).app.dashboard.cardBorder}`,
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 1.5,
});

export const crmIntegratorMappingPill: SxProps<Theme> = (theme) => ({
  px: 1.75,
  py: 1,
  borderRadius: "53px",
  border: `1px solid ${theme.app.dashboard.cardBorder}`,
  backgroundColor: theme.app.dashboard.overlayMedium,
  color: theme.app.text.primary,
  fontSize: 14,
  fontWeight: 500,
  fontFamily: "Manrope, sans-serif",
  minWidth: 0,
});
