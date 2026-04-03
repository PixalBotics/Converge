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

export const tableStatusPill: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.7,
  px: 1.3,
  py: 0.45,
  borderRadius: "9999px",
  bgcolor: "rgba(163, 230, 53, 0.12)",
  border: "1px solid rgba(163, 230, 53, 0.26)",
};

export const tableStatusDot: SxProps<Theme> = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  bgcolor: "#84CC16",
};

export const tableStatusCaption: SxProps<Theme> = {
  color: "#D9F99D",
  fontWeight: 500,
};

export const footerMutedText = (theme: AppTheme): SxProps<Theme> => ({
  color: theme.app.dashboard.textMuted,
});

/** Modal stepper outer (chevron clip) */
export const stepperOuter: SxProps<Theme> = {
  position: "relative",
  width: "100%",
  minHeight: "71.5px",
  clipPath: STEPPER_CLIP,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "stretch",
  boxSizing: "border-box",
  filter: "drop-shadow(0 0 0.5px #CFD6DC)",
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

export const stepperDivider: SxProps<Theme> = {
  width: "1px",
  flexShrink: 0,
  alignSelf: "stretch",
  bgcolor: "#CFD6DC",
};

export const stepperCheckIcon: SxProps<Theme> = {
  fontSize: 28,
  color: "#2563EB",
};

export const stepperNumberCircleActive: SxProps<Theme> = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "2px solid #2563EB",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2563EB",
  fontSize: 12,
  fontWeight: 700,
};

export const stepperNumberCircleInactive: SxProps<Theme> = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "2px solid rgba(207,214,220,0.7)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(207,214,220,0.9)",
  fontSize: 12,
  fontWeight: 700,
};

export const stepperLabelResellerDone: SxProps<Theme> = {
  color: "text.primary",
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.2,
  textAlign: "center",
};

export const stepperLabelResellerActive: SxProps<Theme> = {
  color: "#2563EB",
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.2,
  textAlign: "center",
};

export const stepperLabelChildDone: SxProps<Theme> = {
  color: "text.primary",
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.2,
  textAlign: "center",
};

export const stepperLabelChildInactive: SxProps<Theme> = {
  color: "rgba(207,214,220,0.85)",
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.2,
  textAlign: "center",
};

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

export const deleteIconButton: SxProps<Theme> = (theme) => ({
  width: 43,
  height: 43,
  p: 0,
  color: theme.palette.text.primary,
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

export const addAnotherIcon: SxProps<Theme> = {
  color: "text.secondary",
};

export const addAnotherLabel: SxProps<Theme> = {
  color: "text.secondary",
};

export const websiteTwoColGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
  gap: 1.5,
};
