"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { alpha, styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

function dash(theme: Theme) {
  return (theme as AppTheme).app.dashboard;
}

export const EmailBuilderLayout = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  width: "100%",
}));

/** Full-width builder: toggleable tools + live preview canvas */
export const EmailBuilderStudioRoot = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  width: "100%",
  flex: 1,
  minHeight: 0,
  height: "100%",
  borderRadius: Number(theme.shape.borderRadius) * 2.5,
  border: `1px solid ${dash(theme).cardBorder}`,
  overflow: "hidden",
  background: alpha(theme.palette.common.black, 0.15),
}));

export const EmailBuilderStudioTools = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    flexShrink: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0,
    borderRight: `1px solid ${alpha(d.cardBorder, 0.85)}`,
    background: d.cardBg ?? alpha(theme.palette.background.paper, 0.55),
    backdropFilter: d.cardBackdropBlur,
    boxShadow: `inset -1px 0 0 ${alpha(theme.palette.common.white, 0.04)}`,
    transition: "width 0.22s ease, min-width 0.22s ease, opacity 0.18s ease",
  };
});

export const EmailBuilderStudioCanvas = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  background: alpha(theme.palette.background.paper, 0.04),
}));

export const EmailBuilderWorkspace = styled(Paper)(({ theme }) => {
  const d = dash(theme);
  return {
    borderRadius: Number(theme.shape.borderRadius) * 2.5,
    border: `1px solid ${d.cardBorder}`,
    background: d.cardBg ?? alpha(theme.palette.background.paper, 0.5),
    backdropFilter: d.cardBackdropBlur,
    overflow: "hidden",
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
  };
});

export const EmailBuilderPanel = styled(Paper)(({ theme }) => {
  const d = dash(theme);
  return {
    padding: theme.spacing(2.5),
    borderRadius: Number(theme.shape.borderRadius) * 2,
    border: `1px solid ${d.cardBorder}`,
    background: d.cardBg ?? alpha(theme.palette.background.paper, 0.45),
    backdropFilter: d.cardBackdropBlur,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2.5),
  };
});

export const EmailBuilderSectionTitle = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${alpha(dash(theme).cardBorder, 0.75)}`,
}));

export const EmailBuilderBlockCard = styled(Box, {
  shouldForwardProp: (p) => p !== "selected" && p !== "disabled",
})<{ selected?: boolean; disabled?: boolean }>(({ theme, selected, disabled }) => {
  const primary = theme.palette.primary.main;
  const d = dash(theme);
  return {
    borderRadius: theme.spacing(1.75),
    border: `1px solid ${selected ? alpha(primary, 0.55) : alpha(d.cardBorder, 0.9)}`,
    background: selected
      ? `linear-gradient(165deg, ${alpha(primary, 0.14)} 0%, ${alpha(theme.palette.common.white, 0.04)} 100%)`
      : alpha(theme.palette.common.white, 0.03),
    opacity: disabled ? 0.5 : 1,
    transition: "border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease",
    overflow: "hidden",
    boxShadow: selected
      ? `0 8px 28px ${alpha(primary, 0.12)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.06)}`
      : `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
    "&:hover": disabled
      ? undefined
      : {
          borderColor: selected ? alpha(primary, 0.65) : alpha(d.cardBorder, 1),
          boxShadow: selected
            ? `0 10px 32px ${alpha(primary, 0.16)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.08)}`
            : `0 4px 20px ${alpha(theme.palette.common.black, 0.14)}`,
        },
  };
});

export const EmailBuilderBlockHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1.25, 1.25, 1.25, 1.5),
}));

export const EmailBuilderIconBadge = styled(Box, {
  shouldForwardProp: (p) => p !== "active",
})<{ active?: boolean }>(({ theme, active }) => {
  const primary = theme.palette.primary.main;
  const d = dash(theme);
  return {
    width: 34,
    height: 34,
    borderRadius: theme.spacing(1.25),
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: active
      ? `linear-gradient(145deg, ${alpha(primary, 0.32)} 0%, ${alpha(primary, 0.12)} 100%)`
      : alpha(theme.palette.common.white, 0.06),
    border: `1px solid ${active ? alpha(primary, 0.45) : alpha(d.cardBorder, 0.75)}`,
    color: active ? theme.palette.primary.light : d.sidebarNavIconMuted ?? d.textSubtleMuted,
    boxShadow: active ? `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.12)}` : "none",
  };
});

export const EmailColorSwatchRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  alignItems: "center",
}));

export const EmailColorSwatch = styled("button", {
  shouldForwardProp: (p) => p !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  width: 26,
  height: 26,
  borderRadius: "50%",
  border: selected
    ? `2px solid ${theme.palette.common.white}`
    : `1px solid ${alpha(theme.palette.common.white, 0.22)}`,
  boxShadow: selected
    ? `0 0 0 2px ${theme.palette.primary.main}, 0 2px 8px ${alpha(theme.palette.common.black, 0.25)}`
    : `0 1px 4px ${alpha(theme.palette.common.black, 0.2)}`,
  cursor: "pointer",
  padding: 0,
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
  "&:hover": {
    transform: "scale(1.08)",
  },
}));

export const EmailLogoDropzoneRoot = styled(Box, {
  shouldForwardProp: (p) => p !== "active" && p !== "hasLogo",
})<{ active?: boolean; hasLogo?: boolean }>(({ theme, active, hasLogo }) => {
  const d = dash(theme);
  const primary = theme.palette.primary.main;
  return {
    borderRadius: theme.spacing(1.5),
    border: `2px dashed ${active ? primary : d.cardBorder}`,
    background: active
      ? alpha(primary, 0.08)
      : hasLogo
        ? alpha(theme.palette.common.white, 0.04)
        : alpha(d.pillBg, 0.6),
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    minHeight: 120,
    textAlign: "center",
    transition: "border-color 0.15s ease, background 0.15s ease",
    cursor: "pointer",
  };
});


export const EmailPreviewSticky = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: theme.spacing(1),
}));

export const EmailBuilderChrome = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: 1,
  minHeight: 0,
  width: "100%",
  overflow: "hidden",
  background: `linear-gradient(180deg, ${alpha(theme.palette.common.black, 0.18)} 0%, ${alpha(theme.palette.common.black, 0.08)} 100%)`,
  boxShadow: `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.04)}`,
}));

/** Right-hand tools column: fixed header + scrollable settings body */
export const EmailBuilderToolsPanel = styled(Box)({
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export const EmailBuilderToolsScroll = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    overscrollBehavior: "contain",
    padding: theme.spacing(1.5, 2, 2.5),
    scrollbarGutter: "stable",
    scrollbarWidth: "thin",
    scrollbarColor: `${alpha(d.cardBorder, 1)} ${alpha(theme.palette.common.black, 0.28)}`,
    background: `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 42%), ${alpha(theme.palette.common.black, 0.06)}`,
    "&::-webkit-scrollbar": {
      width: "10px !important",
      display: "block !important",
    },
    "&::-webkit-scrollbar-thumb": {
      background: `${alpha(d.cardBorder, 0.95)} !important`,
      borderRadius: 8,
      border: `2px solid ${alpha(theme.palette.common.black, 0.22)}`,
    },
    "&::-webkit-scrollbar-track": {
      background: `${alpha(theme.palette.common.black, 0.28)} !important`,
      borderRadius: 8,
    },
  };
});

export const EmailBuilderTabRail = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    flexShrink: 0,
    width: 76,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
    padding: theme.spacing(1.25, 0.75, 1.5),
    borderRight: `1px solid ${alpha(d.cardBorder, 0.75)}`,
    background: `linear-gradient(180deg, ${alpha(theme.palette.common.black, 0.22)} 0%, ${alpha(theme.palette.common.black, 0.08)} 100%)`,
    overflowY: "auto",
    minHeight: 0,
    WebkitOverflowScrolling: "touch",
  };
});

export const EmailBuilderRailHeader = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(0.25),
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(0.25),
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.55)}`,
    textAlign: "center",
  };
});

export const EmailBuilderTabButton = styled("button", {
  shouldForwardProp: (p) => p !== "active",
})<{ active?: boolean }>(({ theme, active }) => {
  const primary = theme.palette.primary.main;
  const d = dash(theme);
  const navShadow = (theme as AppTheme).app.dashboard.navSelectedInsetShadow;
  return {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minHeight: 58,
    padding: theme.spacing(1, 0.5),
    border: "none",
    borderRadius: theme.spacing(1.25),
    cursor: "pointer",
    background: active ? d.navItemSelectedBg ?? alpha(primary, 0.24) : "transparent",
    color: active ? theme.palette.primary.light : d.textSubtleMuted,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    lineHeight: 1.15,
    transition: "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease",
    boxShadow: active ? navShadow : "none",
    "&::before": active
      ? {
          content: '""',
          position: "absolute",
          left: 4,
          top: "22%",
          bottom: "22%",
          width: 3,
          borderRadius: 4,
          background: `linear-gradient(180deg, ${theme.palette.primary.light} 0%, ${primary} 100%)`,
        }
      : {},
    "& .tab-icon": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      borderRadius: theme.spacing(1),
      background: active ? alpha(primary, 0.2) : alpha(theme.palette.common.white, 0.05),
      border: `1px solid ${active ? alpha(primary, 0.35) : alpha(d.cardBorder, 0.5)}`,
      color: "inherit",
      transition: "background 0.18s ease, border-color 0.18s ease",
    },
    "&:hover": {
      background: active ? d.navItemSelectedBg ?? alpha(primary, 0.24) : alpha(theme.palette.common.white, 0.07),
      color: active ? theme.palette.primary.light : d.white80 ?? theme.palette.common.white,
      "& .tab-icon": {
        borderColor: active ? alpha(primary, 0.45) : alpha(d.cardBorder, 0.85),
      },
    },
  };
});

export const EmailBuilderCanvasHeader = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    flexShrink: 0,
    zIndex: 2,
    margin: theme.spacing(1.5, 2, 0),
    padding: theme.spacing(1.25, 1.5),
    borderRadius: theme.spacing(1.75),
    border: `1px solid ${alpha(d.cardBorder, 0.75)}`,
    background: d.cardBg ?? alpha(theme.palette.background.paper, 0.92),
    backdropFilter: d.cardBackdropBlur ?? "blur(12px)",
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.14)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.06)}`,
  };
});

export const EmailBuilderPanelBody = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
}));

export const EmailBuilderSettingsGroup = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.25),
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1.75),
    border: `1px solid ${alpha(d.cardBorder, 0.85)}`,
    background: d.cardBg ?? alpha(theme.palette.background.paper, 0.36),
    backdropFilter: d.cardBackdropBlur ?? "blur(12px)",
    boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.1)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.05)}`,
  };
});

export const EmailBuilderGroupTitle = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    "& .section-dot": {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: theme.palette.primary.main,
      boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.55)}`,
      flexShrink: 0,
    },
    "& .section-label": {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      color: d.textSubtleMuted,
    },
  };
});

export const EmailBuilderHintCallout = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "flex-start",
    padding: theme.spacing(1.25, 1.5),
    borderRadius: theme.spacing(1.5),
    border: `1px solid ${alpha(theme.palette.info.main, 0.28)}`,
    background: alpha(theme.palette.info.main, 0.08),
    color: d.textMuted,
    fontSize: 12,
    lineHeight: 1.55,
  };
});

export const EmailBuilderTemplateNameRow = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    marginTop: theme.spacing(1.25),
    padding: theme.spacing(1, 1.25),
    borderRadius: theme.spacing(1.25),
    border: `1px solid ${alpha(d.cardBorder, 0.65)}`,
    background: alpha(theme.palette.common.black, 0.18),
  };
});

export const EmailBuilderReorderGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  borderRadius: theme.spacing(1),
  border: `1px solid ${alpha(dash(theme).cardBorder, 0.75)}`,
  overflow: "hidden",
  background: alpha(theme.palette.common.black, 0.15),
}));

export const EmailBuilderReorderButton = styled("button", {
  shouldForwardProp: (p) => p !== "disabled",
})<{ disabled?: boolean }>(({ theme, disabled }) => {
  const d = dash(theme);
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 26,
    margin: 0,
    padding: 0,
    border: "none",
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.55)}`,
    background: "transparent",
    color: disabled ? d.textSubtleMuted : d.white80 ?? theme.palette.common.white,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    transition: "background 0.15s ease, color 0.15s ease",
    "&:last-of-type": { borderBottom: "none" },
    "&:hover": disabled
      ? undefined
      : {
          background: alpha(theme.palette.primary.main, 0.18),
          color: theme.palette.primary.light,
        },
  };
});

export const EmailBuilderExpandChevron = styled(Box, {
  shouldForwardProp: (p) => p !== "expanded",
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  borderRadius: theme.spacing(0.75),
  flexShrink: 0,
  color: expanded ? theme.palette.primary.light : dash(theme).textSubtleMuted,
  transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
  transition: "transform 0.2s ease, color 0.15s ease",
}));

export const EmailBuilderExpandAction = styled(Box, {
  shouldForwardProp: (p) => p !== "expanded",
})<{ expanded?: boolean }>(({ theme, expanded }) => {
  const primary = theme.palette.primary.main;
  const d = dash(theme);
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.35, 1),
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.02em",
    flexShrink: 0,
    color: expanded ? theme.palette.primary.light : d.textMuted,
    background: expanded ? alpha(primary, 0.14) : alpha(theme.palette.common.white, 0.06),
    border: `1px solid ${expanded ? alpha(primary, 0.4) : alpha(d.cardBorder, 0.85)}`,
    transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
  };
});

export const EmailThemePresetCard = styled("button", {
  shouldForwardProp: (p) => p !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => {
  const primary = theme.palette.primary.main;
  const d = dash(theme);
  return {
    position: "relative",
    textAlign: "left",
    padding: theme.spacing(0.875, 1),
    borderRadius: theme.spacing(1.25),
    border: `1px solid ${selected ? alpha(primary, 0.65) : alpha(d.cardBorder, 0.85)}`,
    background: selected
      ? `linear-gradient(145deg, ${alpha(primary, 0.16)} 0%, ${alpha(theme.palette.common.white, 0.04)} 100%)`
      : alpha(theme.palette.common.white, 0.04),
    cursor: "pointer",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",
    boxShadow: selected ? `0 4px 16px ${alpha(primary, 0.15)}` : "none",
    "&:hover": {
      borderColor: selected ? alpha(primary, 0.75) : alpha(d.cardBorder, 1),
      transform: "translateY(-1px)",
    },
  };
});

export const EmailPreviewDevice = styled(Box)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${dash(theme).cardBorder}`,
  overflow: "hidden",
  background: "#fff",
  boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.25)}`,
}));
