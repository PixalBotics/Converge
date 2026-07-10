import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { cardPadding } from "@/app/dashboard/dashboard.styles";
import { integrationsMainCardSx } from "@/app/dashboard/integrations/integrations.styles";

/** Full-width add-training forms (dashboard card). */
export const aiTrainingFilterGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(3, minmax(0, 1fr))",
  },
  gap: 2,
  alignItems: "end",
  width: "100%",
  "& > *": { minWidth: 0 },
};

/** Narrow filter popover — single column so fields align with platform filter panels. */
export const aiTrainingFilterPopoverGridSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  width: "100%",
  "& > *": { minWidth: 0, width: "100%" },
};

/** Primary content card — same glass stack as Integrations / Users pages. */
export const aiTrainingMainCardSx: SxProps<Theme> = integrationsMainCardSx;

export const aiTrainingStatGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
  gap: 1.5,
};

/** Inner stat tile — frosted panel, accent tint only (no dark slate fill). */
export function aiTrainingStatCardSx(accent: string): SxProps<Theme> {
  return (theme) => {
    const app = (theme as AppTheme).app;
    return {
      p: 1.5,
      borderRadius: 2,
      border: `1px solid ${app.dashboard.cardBorder}`,
      bgcolor: app.dashboard.overlayLight,
      backgroundImage: `linear-gradient(145deg, ${alpha(accent, 0.14)} 0%, transparent 72%)`,
      backdropFilter: app.dashboard.cardBackdropBlur,
      WebkitBackdropFilter: app.dashboard.cardBackdropBlur,
    };
  };
}

export const aiTrainingSectionDividerSx: SxProps<Theme> = (theme) => ({
  mt: 2.5,
  pt: 2.5,
  borderTop: `1px solid ${(theme as AppTheme).app.dashboard.cardBorder}`,
});

/** AI training list / manage pages — title row + actions vertically centered. */
export const aiTrainingPageHeaderSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: { xs: "stretch", md: "center" },
  justifyContent: "space-between",
  gap: 2,
  mb: 2.5,
};

export const aiTrainingPageHeaderActionsSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 1,
  justifyContent: { xs: "flex-start", md: "flex-end" },
  flexShrink: 0,
};

/** Compact scrape status on manage page — aligns with studio live bar. */
export const aiTrainingScrapeStatusCardSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    borderRadius: 2,
    overflow: "hidden",
    border: `1px solid ${app.dashboard.cardBorder}`,
    bgcolor: app.dashboard.overlayLight,
  };
};

/** @deprecated Use aiTrainingMainCardSx + DashboardCard instead */
export const aiTrainingOverviewCardSx: SxProps<Theme> = aiTrainingMainCardSx;

export const aiTrainingSelectedBannerSx: SxProps<Theme> = (theme) => ({
  p: 1.5,
  mb: 2,
  borderRadius: 2,
  border: `1px solid ${theme.palette.success.main}55`,
  bgcolor: `${theme.palette.success.main}12`,
});

/** Horizontal sub-nav tabs across AI Management pages. */
export const aiTrainingSubNavSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    mb: 2.5,
    borderBottom: `1px solid ${app.dashboard.cardBorder}`,
    "& .MuiTabs-indicator": {
      backgroundColor: app.dashboard.accentBlue,
      height: 2,
      borderRadius: 1,
    },
    "& .MuiTab-root": {
      textTransform: "none",
      fontSize: 15,
      fontWeight: 500,
      minHeight: 44,
      py: 1,
      color: app.dashboard.textMuted,
      "&.Mui-selected": {
        color: app.text.primary,
        fontWeight: 600,
      },
    },
  };
};

export const aiTrainingHowItWorksGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
  gap: 1.5,
};

export function aiTrainingHowItWorksStepSx(accent: string): SxProps<Theme> {
  return (theme) => {
    const app = (theme as AppTheme).app;
    return {
      p: 1.75,
      borderRadius: 2,
      border: `1px solid ${app.dashboard.cardBorder}`,
      bgcolor: app.dashboard.overlayLight,
      backgroundImage: `linear-gradient(160deg, ${alpha(accent, 0.1)} 0%, transparent 65%)`,
      height: "100%",
    };
  };
}

export const aiTrainingHubGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
  gap: 2,
};

/** Hub product card — glass DashboardCard padding; accent only on icon chip. */
export const aiTrainingHubCardInnerSx: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  gap: 0,
};

export function aiTrainingHubIconBoxSx(accent: string): SxProps<Theme> {
  return {
    width: 40,
    height: 40,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#fff",
    background: `radial-gradient(100% 100% at 50% 0%, ${accent} 0%, ${alpha(accent, 0.45)} 100%)`,
    boxShadow: "none",
  };
}

/** @deprecated Use DashboardCard + aiTrainingHubCardInnerSx */
export function aiTrainingHubCardSx(_accent: string): SxProps<Theme> {
  return aiTrainingHubCardInnerSx;
}

export const aiTrainingRelationshipBannerSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    p: 1.5,
    mb: 2.5,
    borderRadius: 2,
    border: `1px solid ${alpha(app.dashboard.accentBlue, 0.35)}`,
    bgcolor: app.dashboard.overlayLight,
    backgroundImage: `linear-gradient(135deg, ${alpha(app.dashboard.accentBlue, 0.1)} 0%, transparent 70%)`,
    display: "flex",
    alignItems: "flex-start",
    gap: 1.25,
  };
};

export const aiTrainingQuickActionsSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  mb: 2,
};
