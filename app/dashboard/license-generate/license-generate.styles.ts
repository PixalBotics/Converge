import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { cardPadding, pageWrapper } from "../dashboard.styles";

export const licenseGeneratePageWrapper: SxProps<Theme> = {
  ...pageWrapper,
  width: "100%",
};

export const licenseGeneratePageHeader: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", lg: "row" },
  alignItems: { xs: "stretch", lg: "flex-start" },
  justifyContent: "space-between",
  gap: 2,
  mb: 2.5,
};

export const licenseGenerateHeaderActions: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
  justifyContent: { xs: "flex-start", lg: "flex-end" },
};

export const licenseGenerateFilterCard: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mb: 2.5,
};

export const licenseGenerateFilterTitleRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

export const licenseGenerateFilterIconBox: SxProps<Theme> = (theme) => ({
  width: 36,
  height: 36,
  borderRadius: "50%",
  bgcolor: (theme as AppTheme).app.dashboard.overlayMedium,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: (theme as AppTheme).app.dashboard.iconMuted,
});

export const licenseGenerateFilterGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    lg: "repeat(4, minmax(0, 1fr)) minmax(120px, auto)",
  },
  gap: 2,
  alignItems: "end",
};

export const licenseGenerateTableCard: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const licenseGenerateTableToolbar: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: { xs: "stretch", md: "center" },
  justifyContent: "space-between",
  gap: 2,
};

export const licenseGenerateSearchRow: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "stretch", sm: "center" },
  gap: 1.5,
  width: { xs: "100%", md: "auto" },
};

export const licenseGenerateSearchFieldWrapper: SxProps<Theme> = {
  flex: 1,
  minWidth: { xs: "100%", sm: 220 },
};

export const licenseGenerateFooterRow: SxProps<Theme> = (theme) => ({
  mt: 1,
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "flex-start", sm: "center" },
  justifyContent: "space-between",
  gap: 1.5,
  color: (theme as AppTheme).app.dashboard.textMuted,
  fontSize: 13,
});

export const licenseGeneratePaginationWrapper: SxProps<Theme> = {
  width: { xs: "100%", sm: "auto" },
  display: "flex",
  justifyContent: "flex-end",
  alignSelf: { xs: "stretch", sm: "auto" },
};
