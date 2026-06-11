import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const companyEditPageSx: SxProps<Theme> = {
  maxWidth: 1120,
  width: "100%",
  mx: "auto",
  pb: 10,
  display: "flex",
  flexDirection: "column",
  gap: { xs: 2, md: 2.75 },
};

export const companyEditBreadcrumbSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 0.75,
    fontSize: "0.8125rem",
    color: t.app.dashboard.textMuted,
    "& a": {
      color: t.app.dashboard.textMuted,
      textDecoration: "none",
      "&:hover": { color: t.app.dashboard.white95 },
    },
    "& [data-current]": {
      color: t.app.dashboard.white95,
      fontWeight: 500,
    },
  };
};

export const companyEditHeroSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: { xs: 2, sm: 2.5, md: 3 },
    borderRadius: 3,
    border: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.85)}`,
    background: `linear-gradient(145deg, ${alpha(t.palette.primary.main, 0.14)} 0%, ${alpha(t.app.dashboard.pillBg, 0.55)} 48%, ${alpha(t.app.dashboard.pillBg, 0.35)} 100%)`,
    boxShadow: `0 24px 48px ${alpha(t.palette.common.black, 0.22)}`,
  };
};

export const companyEditChipSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    px: 1.25,
    py: 0.4,
    borderRadius: 999,
    fontSize: "0.75rem",
    fontWeight: 600,
    color: t.app.dashboard.white95,
    bgcolor: alpha(t.app.dashboard.white95, 0.08),
    border: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.9)}`,
  };
};

export const companyEditMainCardSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    borderRadius: 3,
    border: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.9)}`,
    bgcolor: alpha(t.app.dashboard.pillBg, 0.42),
    overflow: "hidden",
    boxShadow: `0 16px 40px ${alpha(t.palette.common.black, 0.18)}`,
  };
};

export const companyEditCardBodySx: SxProps<Theme> = {
  p: { xs: 2, sm: 2.75, md: 3 },
};

export const companyEditSectionSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: { xs: 2, sm: 2.25 },
    borderRadius: 2.5,
    border: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.75)}`,
    bgcolor: alpha(t.palette.common.white, 0.03),
  };
};

export const companyEditSectionIconSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    width: 40,
    height: 40,
    borderRadius: 2,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(t.palette.primary.main, 0.16),
    color: t.palette.primary.light,
  };
};

export const companyEditFormGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
  gap: 2,
  columnGap: 2.5,
};

export const companyEditFormGridFullSx: SxProps<Theme> = {
  gridColumn: { xs: "1", sm: "1 / -1" },
};

export const companyEditChildNavItemSx =
  (active: boolean): SxProps<Theme> =>
  (theme) => {
    const t = theme as AppTheme;
    return {
      display: "flex",
      alignItems: "center",
      gap: 1.25,
      width: "100%",
      p: 1.25,
      borderRadius: 2,
      border: `1px solid ${active ? alpha(t.palette.primary.main, 0.55) : alpha(t.app.dashboard.cardBorder, 0.5)}`,
      bgcolor: active ? alpha(t.palette.primary.main, 0.12) : "transparent",
      cursor: "pointer",
      textAlign: "left",
      transition: "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
      boxShadow: active ? `0 8px 24px ${alpha(t.palette.primary.main, 0.12)}` : "none",
      "&:hover": {
        borderColor: alpha(t.palette.primary.main, 0.4),
        bgcolor: active ? alpha(t.palette.primary.main, 0.14) : alpha(t.app.dashboard.white95, 0.04),
      },
    };
  };

export const companyEditChildNavAvatarSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    width: 36,
    height: 36,
    borderRadius: 1.5,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.875rem",
    fontWeight: 700,
    bgcolor: alpha(t.palette.primary.main, 0.2),
    color: t.palette.primary.light,
  };
};

export const companyEditDividerSx: SxProps<Theme> = (theme) => ({
  height: 1,
  width: "100%",
  bgcolor: alpha((theme as AppTheme).app.dashboard.cardBorder, 0.65),
  my: 2.5,
});

export const companyEditStepHeaderRootSx: SxProps<Theme> = {
  mb: 2.5,
  pb: 2.5,
  borderBottom: (theme) => `1px solid ${alpha((theme as AppTheme).app.dashboard.cardBorder, 0.65)}`,
};

export const companyEditStepHeaderCalloutSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "flex",
    alignItems: "flex-start",
    gap: 1.25,
    mt: 1.75,
    p: 1.5,
    borderRadius: 2,
    border: `1px solid ${alpha(t.palette.primary.main, 0.35)}`,
    bgcolor: alpha(t.palette.primary.main, 0.08),
  };
};

export const companyEditEditablePanelSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: { xs: 2, sm: 2.5 },
    borderRadius: 2.5,
    border: `1px solid ${alpha(t.palette.primary.main, 0.45)}`,
    bgcolor: alpha(t.palette.primary.main, 0.06),
    boxShadow: `inset 0 1px 0 ${alpha(t.palette.common.white, 0.06)}`,
  };
};

export const companyEditReadOnlyPanelSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: { xs: 2, sm: 2.5 },
    borderRadius: 2.5,
    border: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.65)}`,
    bgcolor: alpha(t.palette.common.white, 0.02),
  };
};

export const companyEditReadOnlyBadgeSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "inline-flex",
    alignItems: "center",
    px: 1,
    py: 0.25,
    borderRadius: 999,
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: t.app.dashboard.textMuted,
    bgcolor: alpha(t.app.dashboard.white95, 0.06),
    border: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.7)}`,
  };
};

export const companyEditStep1GridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
  gap: 2.5,
  alignItems: "start",
};

export const companyEditBranchPanelHeaderSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 2,
    flexWrap: "wrap",
    mb: 2.5,
    pb: 2,
    borderBottom: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.65)}`,
  };
};

export const companyEditChildLayoutSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "minmax(260px, 300px) minmax(0, 1fr)" },
  gap: { xs: 2.5, lg: 3 },
  alignItems: "start",
};

export const companyEditChildNavRootSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    position: { lg: "sticky" },
    top: { lg: 16 },
    display: "flex",
    flexDirection: "column",
    gap: 0,
    p: { xs: 0, lg: 1.5 },
    borderRadius: 2.5,
    border: { lg: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.8)}` },
    bgcolor: { lg: alpha(t.palette.common.white, 0.025) },
  };
};

export const companyEditChildNavHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 1,
  mb: 1.25,
  px: { lg: 0.25 },
};

export const companyEditChildNavListSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "flex",
    flexDirection: "column",
    gap: 0.75,
    maxHeight: { xs: 280, lg: "min(520px, calc(100vh - 280px))" },
    overflowY: "auto",
    overflowX: "hidden",
    pr: 0.5,
    scrollbarWidth: "thin",
    scrollbarColor: `${alpha(t.app.dashboard.cardBorder, 0.9)} transparent`,
    "&::-webkit-scrollbar": { width: 6 },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: 999,
      bgcolor: alpha(t.app.dashboard.cardBorder, 0.85),
    },
  };
};

export const companyEditChildNavUnsavedDotSx: SxProps<Theme> = (theme) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  flexShrink: 0,
  bgcolor: (theme as AppTheme).palette.warning.main,
  boxShadow: `0 0 0 2px ${alpha((theme as AppTheme).palette.warning.main, 0.25)}`,
});

export const companyEditStickyFooterSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    position: "sticky",
    bottom: 0,
    zIndex: 4,
    mt: 2,
    mx: { xs: -2, sm: -2.75, md: -3 },
    mb: { xs: -2, sm: -2.75, md: -3 },
    px: { xs: 2, sm: 2.75, md: 3 },
    py: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 1.25,
    borderTop: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.85)}`,
    bgcolor: alpha(t.app.dashboard.pillBg, 0.94),
    backdropFilter: "blur(12px)",
  };
};

export const companyEditFooterActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 1.25,
  ml: "auto",
};
