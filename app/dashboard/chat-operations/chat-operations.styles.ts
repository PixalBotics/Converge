import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const chatOpsPageWrapperSx: SxProps<Theme> = {
  maxWidth: 1600,
  mx: "auto",
};

export const chatOpsShellSx: SxProps<Theme> = (theme) => ({
  p: 0,
  overflow: "hidden",
  background: `linear-gradient(155deg, ${alpha((theme as AppTheme).app.dashboard.accentIndigo, 0.18)} 0%, ${alpha(
    (theme as AppTheme).app.dashboard.accentOrange,
    0.2
  )} 100%)`,
  border: `1px solid ${alpha((theme as AppTheme).app.dashboard.cardBorder, 0.75)}`,
});

export const chatOpsGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "250px 1fr 250px" },
  height: { xs: "auto", lg: "72vh" },
  minHeight: { xs: 620, lg: 620 },
  maxHeight: { xs: "none", lg: 760 },
};

export const chatOpsLeftColSx: SxProps<Theme> = (theme) => ({
  borderRight: `1px solid ${alpha((theme as AppTheme).app.dashboard.cardBorder, 0.8)}`,
  background: alpha((theme as AppTheme).app.dashboard.overlayLight, 0.26),
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
});

export const chatOpsCenterColSx: SxProps<Theme> = (theme) => ({
  borderRight: `1px solid ${alpha((theme as AppTheme).app.dashboard.cardBorder, 0.8)}`,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
});

export const chatOpsRightColSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};

export const chatOpsSectionHeaderSx: SxProps<Theme> = (theme) => ({
  px: 1.8,
  py: 1.5,
  minHeight: 74,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  background: alpha((theme as AppTheme).app.dashboard.overlayLight, 0.2),
  borderBottom: `1px solid ${alpha((theme as AppTheme).app.dashboard.cardBorder, 0.8)}`,
});

export const chatOpsChatListSx: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
    width: 0,
    height: 0,
  },
};

export const chatOpsListStackSx: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

export const chatOpsListMiniHeaderSx: SxProps<Theme> = (theme) => ({
  px: 1.45,
  py: 0.75,
  flexShrink: 0,
  background: alpha((theme as AppTheme).app.dashboard.overlayLight, 0.35),
  borderBottom: `1px solid ${alpha((theme as AppTheme).app.dashboard.cardBorder, 0.6)}`,
});

export const chatOpsToolbarRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 0.75,
  mt: 0.75,
};

export const chatOpsListItemSx = (active: boolean): SxProps<Theme> => (theme) => ({
  p: 1.45,
  borderBottom: `1px solid ${alpha((theme as AppTheme).app.dashboard.cardBorder, 0.65)}`,
  bgcolor: active ? alpha((theme as AppTheme).app.dashboard.accentGreen, 0.82) : alpha((theme as AppTheme).app.dashboard.overlayLight, 0.14),
  cursor: "pointer",
  transition: "background-color 0.18s ease",
  "&:hover": {
    bgcolor: active
      ? alpha((theme as AppTheme).app.dashboard.accentGreen, 0.86)
      : alpha((theme as AppTheme).app.dashboard.overlayLight, 0.24),
  },
});

export const chatOpsMessagesSx: SxProps<Theme> = {
  flex: 1,
  height: 0,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
    width: 0,
    height: 0,
  },
  px: 1.8,
  py: 1.5,
  display: "flex",
  flexDirection: "column",
  gap: 1.4,
};

export const chatOpsBubbleSx = (outgoing: boolean): SxProps<Theme> => (theme) => ({
  alignSelf: outgoing ? "flex-end" : "flex-start",
  maxWidth: "78%",
  px: 1.5,
  py: 1.2,
  borderRadius: "10px",
  bgcolor: outgoing
    ? alpha((theme as AppTheme).app.dashboard.accentYellow, 0.92)
    : alpha((theme as AppTheme).app.dashboard.overlayLight, 0.62),
  border: `1px solid ${alpha((theme as AppTheme).app.dashboard.cardBorder, 0.45)}`,
});

export const chatOpsComposerWrapSx: SxProps<Theme> = (theme) => ({
  borderTop: `1px solid ${alpha((theme as AppTheme).app.dashboard.cardBorder, 0.8)}`,
  px: 1.8,
  py: 1.5,
  background: alpha((theme as AppTheme).app.dashboard.overlayLight, 0.1),
  display: "flex",
  flexDirection: "column",
  gap: 1.2,
});

export const chatOpsChipRowSx: SxProps<Theme> = {
  display: "flex",
  gap: 0.75,
  flexWrap: "wrap",
};

export const chatOpsChipButtonSx = (active: boolean): SxProps<Theme> => (theme) => ({
  minWidth: 0,
  px: 1.5,
  py: 0.55,
  borderRadius: "8px",
  ...(active
    ? {
        bgcolor: alpha((theme as AppTheme).app.dashboard.accentYellow, 0.88),
        color: (theme as AppTheme).app.text.primary,
      }
    : {
        bgcolor: alpha((theme as AppTheme).app.dashboard.overlayLight, 0.55),
        color: (theme as AppTheme).app.text.primary,
      }),
});

export const chatOpsRightBodySx: SxProps<Theme> = {
  p: 1.5,
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  gap: 1.2,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
    width: 0,
    height: 0,
  },
};

export const chatOpsInfoTileSx = (tone: "default" | "mint" | "cream" | "rose" | "blue"): SxProps<Theme> => (theme) => {
  const app = (theme as AppTheme).app;
  const colors = {
    default: alpha(app.dashboard.overlayLight, 0.56),
    mint: alpha(app.dashboard.accentGreenLight, 0.72),
    cream: alpha(app.dashboard.accentYellow, 0.3),
    rose: alpha(app.dashboard.accentPinkLight, 0.42),
    blue: alpha(app.dashboard.accentBlue, 0.74),
  } as const;
  return {
    p: 2,
    borderRadius: "8px",
    backgroundColor: colors[tone],
    border: `1px solid ${alpha(app.dashboard.cardBorder, 0.45)}`,
  };
};

export const chatOpsLinkLineSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.4,
  color: "#5AA7FF",
};

export const chatOpsInfoTitleRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.55,
};
