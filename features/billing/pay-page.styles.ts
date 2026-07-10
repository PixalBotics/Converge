import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { dashboardCardStyles } from "@/components/common/DashboardCard/dashboard-card.styles";

const appTheme = (theme: Theme) => theme as AppTheme;

export const payPageShellSx: SxProps<Theme> = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

export const payPageHeaderSx: SxProps<Theme> = (theme) => {
  const app = appTheme(theme).app;
  return {
    borderBottom: `1px solid ${app.dashboard.cardBorder}`,
    px: { xs: 2, md: 4 },
    py: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    backdropFilter: app.dashboard.headerBackdropBlur,
    WebkitBackdropFilter: app.dashboard.headerBackdropBlur,
    bgcolor: alpha(app.dashboard.headerBg, 0.72),
  };
};

export const payPageContentSx: SxProps<Theme> = {
  flex: 1,
  p: { xs: 2, md: 4 },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const payStatusCardSx =
  (tone: "success" | "pending" | "error" | "loading"): SxProps<Theme> =>
  ((theme) => {
    const t = appTheme(theme);
    const accent =
      tone === "error"
        ? t.palette.error.main
        : tone === "pending" || tone === "loading"
          ? t.palette.warning.main
          : t.palette.success.main;
    return {
      ...(typeof dashboardCardStyles === "function" ? dashboardCardStyles(theme) : dashboardCardStyles),
      width: "100%",
      maxWidth: 560,
      p: { xs: 3, sm: 4 },
      borderRadius: "16px",
      textAlign: "center",
      border: `1px solid ${alpha(accent, 0.45)}`,
      backgroundImage: `linear-gradient(160deg, ${alpha(accent, 0.14)} 0%, ${alpha(t.palette.primary.main, 0.06)} 100%)`,
      boxShadow: `0 16px 48px ${alpha(accent, 0.1)}`,
    };
  }) as SxProps<Theme>;

export const payReceiptRowSx: SxProps<Theme> = (theme) => {
  const app = appTheme(theme).app;
  return {
    display: "flex",
    justifyContent: "space-between",
    gap: 2,
    py: 1,
    borderBottom: `1px solid ${alpha(app.dashboard.cardBorder, 0.6)}`,
    fontSize: 14,
    "&:last-of-type": { borderBottom: "none" },
  };
};
