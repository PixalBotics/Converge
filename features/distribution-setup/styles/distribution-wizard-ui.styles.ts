import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const distributionWizardFooterActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 1.25,
  flexWrap: "wrap",
  flex: "1 1 auto",
  minWidth: 0,
};

export const distributionStepperRootSx: SxProps<Theme> = {
  mb: 3,
  width: "100%",
};

export const distributionStepperProgressTrackSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    height: 4,
    borderRadius: 999,
    bgcolor: alpha(t.app.dashboard.cardBorder, 0.65),
    overflow: "hidden",
    mb: 2,
  };
};

export const distributionStepperProgressFillSx =
  (pct: number): SxProps<Theme> =>
  (theme) => {
    const t = theme as AppTheme;
    return {
      height: "100%",
      width: `${Math.min(100, Math.max(0, pct))}%`,
      borderRadius: 999,
      background: `linear-gradient(90deg, ${t.palette.primary.main}, ${t.palette.primary.light})`,
      transition: "width 0.35s ease",
    };
  };

export const distributionStepperGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(3, minmax(0, 1fr))",
    md: "repeat(5, minmax(0, 1fr))",
  },
  gap: { xs: 1, md: 1.25 },
};

export const distributionStepCardSx =
  (state: "active" | "done" | "upcoming"): SxProps<Theme> =>
  (theme) => {
    const t = theme as AppTheme;
    const base = {
      p: { xs: 1.25, md: 1.5 },
      borderRadius: 2,
      border: `1px solid ${t.app.dashboard.cardBorder}`,
      bgcolor: alpha(t.app.dashboard.pillBg, 0.45),
      display: "flex",
      flexDirection: "column",
      gap: 0.75,
      minHeight: { xs: 88, md: 96 },
      transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
    } as const;

    if (state === "active") {
      return {
        ...base,
        borderColor: alpha(t.palette.primary.main, 0.65),
        bgcolor: alpha(t.palette.primary.main, 0.1),
        boxShadow: `0 0 0 1px ${alpha(t.palette.primary.main, 0.2)}, 0 12px 32px ${alpha(t.palette.primary.main, 0.12)}`,
      };
    }
    if (state === "done") {
      return {
        ...base,
        borderColor: alpha(t.palette.success.main, 0.4),
        bgcolor: alpha(t.palette.success.main, 0.06),
      };
    }
    return base;
  };

export const distributionStepNumberSx =
  (state: "active" | "done" | "upcoming"): SxProps<Theme> =>
  (theme) => {
    const t = theme as AppTheme;
    if (state === "done") {
      return {
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: alpha(t.palette.success.main, 0.2),
        color: t.palette.success.light,
        fontSize: 13,
        fontWeight: 700,
      };
    }
    if (state === "active") {
      return {
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: t.palette.primary.main,
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        boxShadow: `0 4px 14px ${alpha(t.palette.primary.main, 0.45)}`,
      };
    }
    return {
      width: 28,
      height: 28,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: `1px solid ${alpha(t.app.dashboard.textMuted, 0.5)}`,
      color: t.app.dashboard.textMuted,
      fontSize: 13,
      fontWeight: 600,
    };
  };

export const distributionAgentFormCanvasSx: SxProps<Theme> = {
  borderRadius: 2.5,
  overflow: "hidden",
  border: "1px solid #e2e8f0",
  bgcolor: "#f8fafc",
  boxShadow: "0 24px 48px rgba(0,0,0,0.28)",
};

export const distributionAgentFormHeaderSx: SxProps<Theme> = {
  px: 2.5,
  py: 2,
  bgcolor: "#fff",
  borderBottom: "1px solid #e2e8f0",
};

export const distributionAgentFormBodySx: SxProps<Theme> = {
  px: 2.5,
  py: 2.5,
  bgcolor: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: 2.25,
};

/** Light-surface field styles — do not use dashboard InputField inside the white preview. */
export const distributionPreviewFieldLabelSx: SxProps<Theme> = {
  display: "block",
  mb: 0.5,
  color: "#334155",
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.3,
};

export const distributionPreviewFieldValueSx: SxProps<Theme> = {
  display: "block",
  width: "100%",
  px: 1.5,
  py: 1.1,
  minHeight: 42,
  borderRadius: 1.5,
  border: "1px solid #cbd5e1",
  bgcolor: "#f8fafc",
  color: "#0f172a",
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.4,
  boxSizing: "border-box",
};

export const distributionPreviewSelectSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  px: 1.5,
  py: 1.1,
  minHeight: 42,
  borderRadius: 1.5,
  border: "1px solid #cbd5e1",
  bgcolor: "#fff",
  boxSizing: "border-box",
};

export const distributionSettingsLayoutSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "minmax(260px, 320px) 1fr" },
  gap: { xs: 2.5, lg: 3 },
  alignItems: "start",
};

export const distributionChannelCardSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: 2,
    borderRadius: 2,
    border: `1px solid ${t.app.dashboard.cardBorder}`,
    bgcolor: alpha(t.app.dashboard.pillBg, 0.35),
  };
};

export const distributionTestTopRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "minmax(220px, 300px) 1fr" },
  gap: 2,
  alignItems: "start",
};

export const distributionTestRecipientsCardSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: 1.75,
    borderRadius: 2,
    border: `1px solid ${alpha(t.palette.primary.main, 0.4)}`,
    background: `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.14)} 0%, ${alpha(t.app.dashboard.pillBg, 0.95)} 100%)`,
  };
};

export const distributionTestFormWrapSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: { xs: 1.5, md: 2 },
    borderRadius: 2,
    border: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.9)}`,
    bgcolor: alpha(t.app.dashboard.pillBg, 0.4),
  };
};

export const distributionTestFormGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
  gap: 1.25,
  columnGap: 2,
};

export const distributionTestFormFieldFullSx: SxProps<Theme> = {
  gridColumn: { xs: "1", lg: "1 / -1" },
};
