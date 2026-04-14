import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

/** Chevron bar: left inward notch, right outward point, 15px depth */
export const STEPPER_CLIP =
  "polygon(15px 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 15px 100%, 0 50%)";

export const pageWrapper: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2.4,
};

export const pageHeaderRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  flexWrap: "wrap",
};

export const cardTitleRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.3,
};

export const cardTitleIconBox: SxProps<Theme> = {
  width: 32,
  height: 32,
  borderRadius: "8px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
};

export const attachMoneyIconSx = (theme: AppTheme): SxProps<Theme> => ({
  fontSize: 18,
  color: theme.app.dashboard.white95,
});

export const tableStatusPill: SxProps<Theme> = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.7,
  px: 1.3,
  py: 0.45,
  borderRadius: "9999px",
  bgcolor:
    theme.palette.mode === "light" ? "rgba(34, 197, 94, 0.16)" : "rgba(163, 230, 53, 0.12)",
  border:
    theme.palette.mode === "light"
      ? "1px solid rgba(34, 197, 94, 0.3)"
      : "1px solid rgba(163, 230, 53, 0.26)",
});

export const tableStatusDot: SxProps<Theme> = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  bgcolor: "#84CC16",
};

export const tableStatusCaption: SxProps<Theme> = (theme) => ({
  color: theme.palette.mode === "light" ? "#166534" : "#D9F99D",
  fontWeight: 500,
});

export const footerMutedText = (theme: AppTheme): SxProps<Theme> => ({
  color: theme.app.dashboard.textMuted,
});

/** Modal stepper outer (chevron clip) */
export const stepperOuter: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    position: "relative",
    width: "100%",
    minHeight: "71.5px",
    clipPath: STEPPER_CLIP,
    background: alpha(app.dashboard.pillBg, 0.92),
    display: "flex",
    alignItems: "stretch",
    boxSizing: "border-box",
    filter: `drop-shadow(0 0 0.5px ${app.dashboard.cardBorder})`,
  };
};

export const stepperSegment: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 1.25,
  py: 1.5,
  px: 1,
};

export const stepperDivider: SxProps<Theme> = (theme) => ({
  width: "1px",
  flexShrink: 0,
  alignSelf: "stretch",
  bgcolor: (theme as AppTheme).app.dashboard.cardBorder,
});

export const stepperCheckIcon: SxProps<Theme> = (theme) => ({
  fontSize: 28,
  color: (theme as AppTheme).app.dashboard.accentBlue,
});

export const stepperNumberCircleActive: SxProps<Theme> = (theme) => {
  const accent = (theme as AppTheme).app.dashboard.accentBlue;
  return {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: `2px solid ${accent}`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: accent,
    fontSize: 12,
    fontWeight: 700,
  };
};

export const stepperNumberCircleInactive: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  const muted = app.dashboard.textMuted;
  return {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: `2px solid ${alpha(muted, 0.75)}`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: muted,
    fontSize: 12,
    fontWeight: 700,
  };
};

export const stepperLabelResellerDone: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.white95,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.2,
  textAlign: "center",
});

export const stepperLabelResellerActive: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.accentBlue,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.2,
  textAlign: "center",
});

export const stepperLabelChildDone: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.white95,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.2,
  textAlign: "center",
});

export const stepperLabelChildInactive: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.2,
  textAlign: "center",
});

export const stepOneIncompleteHint: SxProps<Theme> = {
  color: "rgba(248,113,113,0.95)",
  mt: -0.5,
};

export const sectionStack: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
};

export const sectionHeaderRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mb: -1,
};

export const sectionHeaderRowWebsiteFirst: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mt: 0.5,
  mb: -1,
};

export const sectionHeaderRowWebsiteRest: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mt: 0,
  mb: -1,
};

export const deleteIconButton: SxProps<Theme> = {
  width: 43,
  height: 43,
  p: 0,
};

export const addAnotherButton: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.8,
  mt: -0.5,
  border: "none",
  background: "transparent",
  p: 0,
  cursor: "pointer",
};

export const addAnotherIcon: SxProps<Theme> = {
  color: "rgba(255,255,255,0.8)",
};

export const addAnotherLabel: SxProps<Theme> = {
  color: "rgba(255,255,255,0.8)",
};

export const websiteTwoColGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
  gap: 1.5,
};
