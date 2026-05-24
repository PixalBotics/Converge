import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const assignmentStepRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flexWrap: "wrap",
  mb: 2,
};

export const assignmentStepChipSx =
  (active: boolean): SxProps<Theme> =>
  (theme) => {
    const t = theme as AppTheme;
    return {
      height: 28,
      fontSize: 12,
      fontWeight: 600,
      borderRadius: "999px",
      bgcolor: active ? alpha(t.palette.primary.main, 0.18) : alpha(t.app.dashboard.pillBg, 0.6),
      color: active ? t.palette.primary.main : t.app.dashboard.textMuted,
      border: `1px solid ${active ? alpha(t.palette.primary.main, 0.45) : t.app.dashboard.cardBorder}`,
    };
  };

export const rosterChannelPanelSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: 2,
    borderRadius: 2,
    border: `1px solid ${t.app.dashboard.cardBorder}`,
    bgcolor: alpha(t.app.dashboard.pillBg, 0.35),
  };
};

export const rosterTierRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "112px 1fr" },
  gap: 1.25,
  alignItems: "center",
  py: 0.75,
};

export const departmentCardSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: 2.5,
    mb: 2,
    borderRadius: 2.5,
    border: `1px solid ${t.app.dashboard.cardBorder}`,
    bgcolor: alpha(t.app.dashboard.cardBg ?? t.app.dashboard.pillBg, 0.4),
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      borderColor: alpha(t.palette.primary.main, 0.35),
      boxShadow: `0 8px 28px ${alpha(t.palette.primary.main, 0.08)}`,
    },
  };
};

export const rosterRankBannerSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    mb: 1.5,
    p: 1.25,
    borderRadius: 1.5,
    bgcolor: alpha(t.palette.primary.main, 0.1),
    border: `1px solid ${alpha(t.palette.primary.main, 0.28)}`,
  };
};

export const schedulingStepRowSx = assignmentStepRowSx;

export const schedulingStepChipSx = assignmentStepChipSx;

export const crossMidnightCardSx =
  (active: boolean): SxProps<Theme> =>
  (theme) => {
    const t = theme as AppTheme;
    return {
      display: "flex",
      alignItems: "flex-start",
      gap: 1.25,
      p: 1.5,
      borderRadius: 2,
      cursor: "pointer",
      transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
      border: `2px solid ${
        active ? alpha(t.palette.warning.main, 0.75) : t.app.dashboard.cardBorder
      }`,
      bgcolor: active ? alpha(t.palette.warning.main, 0.14) : alpha(t.app.dashboard.pillBg, 0.35),
      boxShadow: active ? `0 0 0 1px ${alpha(t.palette.warning.main, 0.25)}` : "none",
      "&:hover": {
        borderColor: active
          ? alpha(t.palette.warning.main, 0.9)
          : alpha(t.palette.warning.main, 0.45),
      },
    };
  };

export const serviceWindowCardSx =
  (crossesMidnight: boolean): SxProps<Theme> =>
  (theme) => {
    const t = theme as AppTheme;
    return {
      p: 2,
      borderRadius: 2.5,
      border: `1px solid ${
        crossesMidnight ? alpha(t.palette.warning.main, 0.5) : t.app.dashboard.cardBorder
      }`,
      bgcolor: crossesMidnight
        ? alpha(t.palette.warning.main, 0.06)
        : "rgba(255,255,255,0.02)",
      boxShadow: crossesMidnight
        ? `inset 4px 0 0 ${alpha(t.palette.warning.main, 0.85)}`
        : "none",
    };
  };

export const gapPolicyCardSx =
  (selected: boolean): SxProps<Theme> =>
  (theme) => {
    const t = theme as AppTheme;
    return {
      p: 1.5,
      borderRadius: 2,
      cursor: "pointer",
      border: `1px solid ${selected ? alpha(t.palette.primary.main, 0.55) : t.app.dashboard.cardBorder}`,
      bgcolor: selected ? alpha(t.palette.primary.main, 0.12) : alpha(t.app.dashboard.pillBg, 0.35),
      transition: "border-color 0.2s ease, background-color 0.2s ease",
      "&:hover": {
        borderColor: alpha(t.palette.primary.main, 0.4),
      },
    };
  };

export const emptyStatePanelSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: 3,
    borderRadius: 2,
    textAlign: "center",
    border: `1px dashed ${t.app.dashboard.cardBorder}`,
    bgcolor: alpha(t.app.dashboard.pillBg, 0.25),
  };
};

export const journeyStepperRootSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
    gap: { xs: 1.5, md: 2 },
    alignItems: "stretch",
    p: { xs: 2, sm: 2.5 },
    mb: 3,
    borderRadius: 3,
    border: `1px solid ${t.app.dashboard.cardBorder}`,
    background: `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.12)} 0%, ${alpha(t.app.dashboard.pillBg, 0.5)} 48%, ${alpha(t.palette.success.main, 0.06)} 100%)`,
    boxShadow: `0 12px 40px ${alpha(t.palette.common.black, 0.22)}`,
  };
};

/** Four-step website assignment flow (select → schedule → roster → complete). */
export const flowStepperRootSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "1fr 1fr",
      xl: "1fr auto 1fr auto 1fr auto 1fr",
    },
    gap: { xs: 1.25, md: 1.5 },
    alignItems: "stretch",
    p: { xs: 2, sm: 2.5 },
    mb: 3,
    borderRadius: 3,
    border: `1px solid ${t.app.dashboard.cardBorder}`,
    background: `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.14)} 0%, ${alpha(t.app.dashboard.pillBg, 0.52)} 45%, ${alpha(t.palette.success.main, 0.08)} 100%)`,
    boxShadow: `0 16px 48px ${alpha(t.palette.common.black, 0.2)}`,
  };
};

export const flowStepperConnectorSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: { xs: "none", xl: "flex" },
    alignItems: "center",
    justifyContent: "center",
    px: 0.25,
    color: t.app.dashboard.textMuted,
  };
};

export const journeyStepCardSx =
  (state: "active" | "complete" | "upcoming"): SxProps<Theme> =>
  (theme) => {
    const t = theme as AppTheme;
    const border =
      state === "active"
        ? alpha(t.palette.primary.main, 0.65)
        : state === "complete"
          ? alpha(t.palette.success.main, 0.55)
          : t.app.dashboard.cardBorder;
    const bg =
      state === "active"
        ? alpha(t.palette.primary.main, 0.14)
        : state === "complete"
          ? alpha(t.palette.success.main, 0.1)
          : alpha(t.app.dashboard.pillBg, 0.45);
    return {
      display: "flex",
      gap: 1.5,
      alignItems: "flex-start",
      p: 2,
      borderRadius: 2.5,
      border: `1px solid ${border}`,
      bgcolor: bg,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
      boxShadow:
        state === "active" ? `0 0 0 1px ${alpha(t.palette.primary.main, 0.25)}` : "none",
      "&:hover": state === "upcoming" ? { borderColor: alpha(t.palette.primary.main, 0.35) } : {},
    };
  };

export const journeyConnectorSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: { xs: "none", md: "flex" },
    alignItems: "center",
    justifyContent: "center",
    px: 0.5,
    color: t.app.dashboard.textMuted,
  };
};

export const schedulingSuccessPanelSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: { xs: 3, sm: 4 },
    borderRadius: 3,
    textAlign: "center",
    border: `1px solid ${alpha(t.palette.success.main, 0.45)}`,
    background: `linear-gradient(160deg, ${alpha(t.palette.success.main, 0.16)} 0%, ${alpha(t.palette.primary.main, 0.08)} 100%)`,
    boxShadow: `0 16px 48px ${alpha(t.palette.success.main, 0.12)}`,
  };
};

export const scheduleFormActionBarSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    alignItems: { xs: "stretch", md: "center" },
    justifyContent: "space-between",
    gap: 2,
    mt: 3,
    pt: 2.5,
    borderTop: `1px solid ${t.app.dashboard.cardBorder}`,
    position: "sticky",
    bottom: 0,
    zIndex: 2,
    bgcolor: alpha(t.app.dashboard.cardBg ?? "#0f1419", 0.92),
    backdropFilter: "blur(8px)",
    borderRadius: "0 0 12px 12px",
    mx: -0.5,
    px: 0.5,
    pb: 0.5,
  };
};

export const websiteFlowStepperRootSx: SxProps<Theme> = {
  mb: 3,
  width: "100%",
};

export const websiteFlowProgressTrackSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    height: 4,
    borderRadius: 999,
    bgcolor: alpha(t.app.dashboard.cardBorder, 0.65),
    overflow: "hidden",
    mb: 2,
  };
};

export const websiteFlowProgressFillSx =
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

export const websiteFlowStepperGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(4, minmax(0, 1fr))",
  },
  gap: { xs: 1, md: 1.25 },
};

export const websiteFlowStepCardSx =
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
      gap: 0.5,
      minHeight: { xs: 80, md: 88 },
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
        borderColor: alpha(t.palette.success.main, 0.45),
        bgcolor: alpha(t.palette.success.main, 0.08),
      };
    }
    return base;
  };

export const websiteFlowStepNumberSx =
  (state: "active" | "done" | "upcoming"): SxProps<Theme> =>
  (theme) => {
    const t = theme as AppTheme;
    const color =
      state === "active"
        ? t.palette.primary.main
        : state === "done"
          ? t.palette.success.main
          : t.app.dashboard.textMuted;
    return {
      width: 28,
      height: 28,
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 700,
      flexShrink: 0,
      bgcolor: alpha(color, 0.16),
      color,
      border: `1px solid ${alpha(color, 0.35)}`,
    };
  };
