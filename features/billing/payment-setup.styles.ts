import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { dashboardCardStyles } from "@/components/common/DashboardCard/dashboard-card.styles";
import { pageWrapper } from "@/app/dashboard/companies/overview.styles";

const appTheme = (theme: Theme) => theme as AppTheme;

export const paymentSetupWrapper: SxProps<Theme> = {
  ...pageWrapper,
  maxWidth: 1100,
  mx: "auto",
};

export const paymentHeroCard: SxProps<Theme> = ((theme) => {
  const app = appTheme(theme).app;
  const isLight = theme.palette.mode === "light";
  const accent = app.dashboard.accentBlue;
  const purple = app.dashboard.accentPurple;
  return {
    ...(typeof dashboardCardStyles === "function" ? dashboardCardStyles(theme) : dashboardCardStyles),
    position: "relative",
    overflow: "hidden",
    borderRadius: "16px",
    p: { xs: 2.5, md: 3 },
    mb: 3,
    backgroundImage: isLight
      ? `radial-gradient(120% 140% at 100% 0%, ${alpha(accent, 0.14)} 0%, transparent 55%),
         radial-gradient(80% 100% at 0% 100%, ${alpha(purple, 0.12)} 0%, transparent 50%)`
      : `radial-gradient(120% 140% at 100% 0%, ${alpha(accent, 0.22)} 0%, transparent 55%),
         radial-gradient(80% 100% at 0% 100%, ${alpha(purple, 0.18)} 0%, transparent 50%)`,
  };
}) as SxProps<Theme>;

export const paymentStatGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
  gap: 2,
  mb: 3,
};

export const paymentStatCard =
  (accentColor: string): SxProps<Theme> =>
  ((theme) => {
    const app = appTheme(theme).app;
    return {
      ...(typeof dashboardCardStyles === "function" ? dashboardCardStyles(theme) : dashboardCardStyles),
      p: 2,
      borderRadius: "14px",
      position: "relative",
      overflow: "hidden",
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: accentColor,
        zIndex: 2,
      },
      "& > *": { position: "relative", zIndex: 1 },
    };
  }) as SxProps<Theme>;

export const paymentStepsColumn: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0,
};

export const paymentStepCard =
  (done: boolean): SxProps<Theme> =>
  ((theme) => {
    const app = appTheme(theme).app;
    return {
      ...(typeof dashboardCardStyles === "function" ? dashboardCardStyles(theme) : dashboardCardStyles),
      display: "flex",
      gap: 2,
      p: 2.5,
      borderRadius: "14px",
      mb: 2,
      ...(done
        ? {
            boxShadow: `inset 0 0 0 1px ${alpha(app.dashboard.accentGreen, 0.35)}`,
            backgroundColor: alpha(app.dashboard.accentGreen, theme.palette.mode === "light" ? 0.06 : 0.1),
          }
        : {}),
    };
  }) as SxProps<Theme>;

export const paymentStepIcon =
  (accent: string): SxProps<Theme> =>
  (theme) => ({
    width: 48,
    height: 48,
    borderRadius: "14px",
    background: `linear-gradient(135deg, ${accent} 0%, ${alpha(accent, 0.72)} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: 22,
    color: theme.palette.mode === "light" ? "#fff" : appTheme(theme).app.dashboard.gradientButtonText,
    boxShadow: `0 10px 24px ${alpha(accent, 0.35)}`,
  });

export const paymentProgressTrack: SxProps<Theme> = (theme) => {
  const app = appTheme(theme).app;
  return {
    height: 8,
    borderRadius: 999,
    bgcolor: alpha(app.dashboard.textMuted, theme.palette.mode === "light" ? 0.15 : 0.25),
    overflow: "hidden",
    mt: 2,
  };
};

export const paymentProgressFill: SxProps<Theme> = (theme) => {
  const app = appTheme(theme).app;
  return {
    height: "100%",
    borderRadius: 999,
    background: `linear-gradient(90deg, ${app.dashboard.accentBlue} 0%, ${app.dashboard.accentPurple} 50%, ${app.dashboard.accentGreen} 100%)`,
    transition: "width 0.4s ease",
  };
};

export const paymentAsideCard: SxProps<Theme> = ((theme) => ({
  ...(typeof dashboardCardStyles === "function" ? dashboardCardStyles(theme) : dashboardCardStyles),
  p: 2.5,
  borderRadius: "14px",
  position: "sticky",
  top: 24,
})) as SxProps<Theme>;

export const paymentInfoBanner: SxProps<Theme> = (theme) => {
  const app = appTheme(theme).app;
  return {
    p: 2,
    mb: 2,
    borderRadius: "14px",
    border: `1px dashed ${app.dashboard.cardBorder}`,
    bgcolor: alpha(app.dashboard.accentBlue, theme.palette.mode === "light" ? 0.06 : 0.12),
  };
};

export const paymentQuickLink: SxProps<Theme> = (theme) => {
  const app = appTheme(theme).app;
  return {
    display: "block",
    px: 1.5,
    py: 1,
    borderRadius: "10px",
    color: app.dashboard.textMuted,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    border: `1px solid ${app.dashboard.cardBorder}`,
    transition: "all 0.15s ease",
    "&:hover": {
      color: app.text.primary,
      borderColor: alpha(app.dashboard.accentBlue, 0.45),
      bgcolor: alpha(app.dashboard.accentBlue, 0.08),
    },
  };
};
