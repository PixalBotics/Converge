"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { alpha, styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";

function dash(theme: Theme) {
  return (theme as AppTheme).app.dashboard;
}

function appText(theme: Theme) {
  return (theme as AppTheme).app.text;
}

// —— Page layout (matches departments / website-assigning tables) ——

export const EmailConfigPageHeaderRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing(2),
}));

export const EmailConfigTableCard = styled(Paper)(({ theme }) => {
  const d = dash(theme);
  return {
    padding: theme.spacing(2.5),
    borderRadius: Number(theme.shape.borderRadius) * 2,
    border: `1px solid ${d.cardBorder}`,
    background: d.cardBg ?? alpha(theme.palette.background.paper, 0.4),
    backdropFilter: d.cardBackdropBlur,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2.5),
  };
});

export const EmailConfigCardTitleRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
}));

export const EmailConfigIconBox = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: theme.spacing(1),
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  backgroundColor: alpha(theme.palette.common.white, 0.08),
  border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
}));

export const EmailConfigCardHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  borderBottom: `1px solid ${alpha(dash(theme).cardBorder, 0.65)}`,
}));

export const EmailConfigCardSubtitle = styled(Typography)(({ theme }) => ({
  color: dash(theme).textMuted,
  maxWidth: 640,
  lineHeight: 1.5,
}));

// —— Form steps (clear progression, no nested boxes) ——

export const EmailFormStepsStack = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

export const EmailFormStep = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.75),
}));

export const EmailFormStepHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1.5),
}));

export const EmailFormStepNumber = styled(Box)(({ theme }) => {
  const primary = theme.palette.primary.main;
  return {
    width: 28,
    height: 28,
    borderRadius: "50%",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: appText(theme).primary,
    background: alpha(primary, 0.18),
    border: `1px solid ${alpha(primary, 0.35)}`,
  };
});

export const EmailFormStepTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: appText(theme).primary,
  lineHeight: 1.3,
}));

export const EmailFormStepDescription = styled(Typography)(({ theme }) => ({
  color: dash(theme).textMuted,
  marginTop: theme.spacing(0.25),
  display: "block",
  lineHeight: 1.45,
}));

export const EmailFormStepBody = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(5.25),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    paddingLeft: 0,
  },
}));

export const EmailSectionLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: appText(theme).primary,
  marginBottom: theme.spacing(1),
  letterSpacing: 0.3,
  textTransform: "uppercase",
  fontSize: 11,
}));

// Legacy alias — flat section without extra border
export const EmailConfigSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

export const EmailConfigStepTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: appText(theme).primary,
  marginBottom: theme.spacing(0.75),
}));

// —— Provider pickers ——

export const EmailConfigKindGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: theme.spacing(1.5),
  maxWidth: 520,
}));

export const EmailConfigKindCard = styled("button", {
  shouldForwardProp: (p) => p !== "selected" && p !== "disabled",
})<{ selected?: boolean; disabled?: boolean }>(({ theme, selected, disabled }) => {
  const primary = theme.palette.primary.main;
  const d = dash(theme);
  return {
    textAlign: "left",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1.75),
    border: `1px solid ${selected ? primary : d.cardBorder}`,
    background: selected ? alpha(primary, 0.14) : d.pillBg,
    color: "inherit",
    font: "inherit",
    transition: "border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease",
    boxShadow: selected ? `0 4px 16px ${alpha(theme.palette.common.black, 0.2)}` : "none",
    "&:hover": disabled
      ? {}
      : {
          borderColor: primary,
          background: selected ? alpha(primary, 0.16) : alpha(theme.palette.common.white, 0.06),
        },
  };
});

export const EmailConfigProviderGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(1.25),
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
}));

export const EmailConfigProviderCard = styled("button", {
  shouldForwardProp: (p) => p !== "selected" && p !== "disabled",
})<{ selected?: boolean; disabled?: boolean }>(({ theme, selected, disabled }) => {
  const primary = theme.palette.primary.main;
  const d = dash(theme);
  return {
    textAlign: "left",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    padding: theme.spacing(1.75),
    borderRadius: theme.spacing(1.5),
    border: `1px solid ${selected ? primary : d.cardBorder}`,
    background: selected ? alpha(primary, 0.12) : "transparent",
    color: "inherit",
    font: "inherit",
    transition: "border-color 0.15s ease, background 0.15s ease",
    "&:hover": disabled
      ? {}
      : {
          borderColor: primary,
          background: alpha(primary, 0.08),
        },
  };
});

export const EmailConfigFormGrid2 = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "1fr 1fr",
  },
}));

export const EmailConfigModalDivider = styled(Box)(({ theme }) => ({
  height: 1,
  width: "100%",
  background: alpha(dash(theme).cardBorder, 0.8),
  margin: theme.spacing(1, 0),
}));

// —— Test + enable blocks ——

export const EmailTestPanelCard = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1.5),
    border: `1px solid ${alpha(d.cardBorder, 0.9)}`,
    background: d.pillBg,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
  };
});

export const EmailEnableRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(1.75, 2),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(dash(theme).cardBorder, 0.85)}`,
  background: alpha(theme.palette.common.white, 0.03),
  flexWrap: "wrap",
}));

export const EmailHelpAlert = styled(Alert)(({ theme }) => {
  const app = (theme as AppTheme).app;
  return {
    alignItems: "flex-start",
    borderColor: alpha(app.dashboard.cardBorder, 0.9),
    backgroundColor: alpha(app.dashboard.pillBg, 0.85),
    color: app.text.primary,
    "& .MuiAlert-message": { width: "100%", paddingTop: 2 },
  };
});

export const EmailFormActionsBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: theme.spacing(1.5),
  flexWrap: "wrap",
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${alpha(dash(theme).cardBorder, 0.65)}`,
}));
