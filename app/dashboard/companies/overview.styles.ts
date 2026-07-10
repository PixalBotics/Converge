import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { dashboardPageShell } from "../dashboard.styles";

/** Readable multi-line helper / validation copy inside modals and forms. */
export const formHintTextSx: SxProps<Theme> = {
  whiteSpace: "normal",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
  lineHeight: 1.5,
};

export const pageWrapper: SxProps<Theme> = {
  ...dashboardPageShell,
  display: "flex",
  flexDirection: "column",
  gap: { xs: 1.5, sm: 2, md: 2.4 },
};

export const pageHeaderRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  flexWrap: "wrap",
};

/** Stats row (same grid as user-page overview) */
export const overviewCardsRow: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
  gap: 2,
  mb: 0,
};

export const overviewCard: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2, md: 2.5 },
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
};

export const overviewStatValue: SxProps<Theme> = {
  display: "flex",
  alignItems: "baseline",
  gap: 0.5,
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
  flexShrink: 0,
  lineHeight: 0,
  backgroundColor: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  "& .MuiSvgIcon-root": {
    display: "block",
    lineHeight: 0,
    margin: 0,
  },
};

export const attachMoneyIconSx = (theme: AppTheme): SxProps<Theme> => ({
  fontSize: 18,
  width: 18,
  height: 18,
  display: "block",
  lineHeight: 0,
  flexShrink: 0,
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

export const stepperOuter: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    position: "relative",
    width: "100%",
    minHeight: { xs: "auto", sm: "71.5px" },
    borderRadius: 2,
    background: alpha(app.dashboard.pillBg, 0.92),
    display: "flex",
    alignItems: "stretch",
    boxSizing: "border-box",
    border: `1px solid ${app.dashboard.cardBorder}`,
    overflow: "hidden",
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
  px: { xs: 1.25, sm: 1.5 },
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
  lineHeight: 1.35,
  textAlign: "center",
  whiteSpace: "normal",
  wordBreak: "break-word",
});

export const stepperLabelResellerActive: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.accentBlue,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.35,
  textAlign: "center",
  whiteSpace: "normal",
  wordBreak: "break-word",
});

export const stepperLabelChildDone: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.white95,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.35,
  textAlign: "center",
  whiteSpace: "normal",
  wordBreak: "break-word",
});

export const stepperLabelChildInactive: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.35,
  textAlign: "center",
  whiteSpace: "normal",
  wordBreak: "break-word",
});

export const stepOneIncompleteHint: SxProps<Theme> = {
  color: "rgba(248,113,113,0.95)",
  mt: 0.5,
  ...formHintTextSx,
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

export const childRemoveIconButton: SxProps<Theme> = (theme) => ({
  alignSelf: "center",
  flexShrink: 0,
  color: (theme as AppTheme).app.dashboard.textMuted,
  "&:hover": {
    color: (theme as AppTheme).app.text.primary,
    bgcolor: "rgba(255,255,255,0.06)",
  },
});

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

export const addAnotherButtonRight: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.8,
  border: "none",
  background: "transparent",
  p: 0,
  cursor: "pointer",
  flexShrink: 0,
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
