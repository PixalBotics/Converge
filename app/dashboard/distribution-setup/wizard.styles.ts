import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { cardPadding, pageWrapper } from "../dashboard.styles";

export const distributionWizardPageWrapper: SxProps<Theme> = {
  ...pageWrapper,
  width: "100%",
  maxWidth: 1280,
  display: "flex",
  flexDirection: "column",
  gap: 0,
  pb: 3,
};

export const distributionWizardPageHeader: SxProps<Theme> = {
  mb: 2,
};

export const distributionWizardBackLinkSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.75,
    mb: 1.5,
    color: t.app.dashboard.textMuted,
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    width: "fit-content",
    transition: "color 0.15s ease",
    "&:hover": { color: t.palette.primary.light },
  };
};

export const distributionWizardStepperWrap: SxProps<Theme> = {
  mb: 2.5,
  width: "100%",
  overflowX: "auto",
  pb: 0.5,
};

export const distributionWizardMainCardSx: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  gap: 0,
  height: "auto",
  minHeight: 0,
  flex: 1,
};

export const distributionWizardSectionHeader: SxProps<Theme> = {
  mb: 2.5,
  pb: 2,
  borderBottom: (theme) => `1px solid ${alpha((theme as AppTheme).app.dashboard.cardBorder, 0.75)}`,
};

export const distributionWizardSectionBody: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  py: 0.5,
};

export const distributionWizardCardFooter: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1.5,
    flexWrap: "wrap",
    width: "100%",
    mt: 3,
    pt: 2.5,
    borderTop: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.75)}`,
  };
};

export const distributionWizardFormGrid3: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
  gap: 2,
  alignItems: "start",
};

export const distributionWizardTableToolbar: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 1.5,
  flexWrap: "wrap",
  width: "100%",
};

export const distributionWizardTableSearchWrap: SxProps<Theme> = {
  flex: "1 1 auto",
  minWidth: 0,
  maxWidth: 400,
};

export const distributionWizardTablePanelSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    borderRadius: 2,
    border: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.75)}`,
    bgcolor: alpha(t.app.dashboard.overlayLight, 0.35),
    overflow: "hidden",
  };
};

export const distributionWizardTableSx: SxProps<Theme> = {
  tableLayout: "fixed",
  "& th:first-of-type, & td:first-of-type": {
    width: "22%",
  },
  "& th:last-of-type, & td:last-of-type": {
    width: 128,
    textAlign: "right",
  },
};

export const distributionWizardDraftNoticeSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "flex",
    alignItems: "flex-start",
    gap: 1,
    mb: 2,
    px: 1.75,
    py: 1.25,
    borderRadius: 2,
    border: `1px solid ${alpha(t.palette.warning.main, 0.35)}`,
    bgcolor: alpha(t.palette.warning.main, 0.08),
    color: t.palette.warning.light,
    fontSize: 14,
    lineHeight: 1.5,
  };
};

export const distributionWizardDraftFieldSx = (theme: AppTheme): SxProps<Theme> => ({
  minWidth: { xs: 72, sm: 120 },
  "& .MuiOutlinedInput-root": {
    fontSize: 13,
    fontWeight: 500,
    backgroundColor: alpha(theme.app.dashboard.overlayLight, 0.85),
    borderRadius: 1.25,
  },
  "& .MuiOutlinedInput-input": {
    py: 1.1,
    px: 1.25,
    color: theme.app.text.primary,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: alpha(theme.app.border.input, 0.9),
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.app.border.inputFocus,
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
    borderWidth: 1,
  },
});

export const distributionWizardSelectedScopeSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
    gap: 2,
    p: 2,
    borderRadius: 2,
    border: `1px solid ${alpha(t.palette.primary.main, 0.35)}`,
    background: `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.1)} 0%, ${alpha(t.app.dashboard.pillBg, 0.85)} 100%)`,
  };
};

/** @deprecated use distributionWizardMainCardSx */
export const distributionWizardCardSx = distributionWizardMainCardSx;
