import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

function dash(theme: Theme) {
  return (theme as AppTheme).app.dashboard;
}

export const chatLivePageStackSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  gap: { xs: 1.25, md: 1.75 },
};

/** Agent inbox without scope filters — tighter header-to-workspace rhythm. */
export const chatLiveAgentStackSx: SxProps<Theme> = {
  ...chatLivePageStackSx,
  gap: { xs: 1, md: 1.25 },
};

export const chatLiveFilterCardSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const isLight = theme.palette.mode === "light";
  const glassFill = isLight ? "rgba(255, 255, 255, 0.16)" : "rgba(8, 12, 22, 0.18)";
  const resolvedBlur = d.cardBackdropBlur;
  return {
    flexShrink: 0,
    borderRadius: { xs: 8, md: 10 },
    border: `1px solid ${alpha(d.cardBorder, 0.35)}`,
    backgroundColor: glassFill,
    backgroundImage:
      "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
    backdropFilter: resolvedBlur,
    WebkitBackdropFilter: resolvedBlur,
    px: { xs: 1.5, md: 2 },
    py: { xs: 1.25, md: 1.5 },
  };
};

export const chatLiveFilterHintSx: SxProps<Theme> = (theme) => ({
  display: "block",
  fontSize: 14,
  lineHeight: 1.45,
  color: dash(theme).textMuted,
  py: 0.75,
  mb: 1,
});

export const chatLiveFilterGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    md: "repeat(3, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr))",
  },
  gap: 1.25,
  alignItems: "start",
  minWidth: 0,
};

export const chatLiveNavStripSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    display: "inline-flex",
    flexWrap: "wrap",
    gap: 0.5,
    p: 0.4,
    borderRadius: "10px",
    border: `1px solid ${alpha(d.cardBorder, 0.28)}`,
    bgcolor: alpha(d.overlayLight, 0.22),
  };
};

export const chatLiveNavRowSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  alignItems: "center",
  mt: 1.25,
};

export const chatLiveNavLinkSx =
  (active: boolean): SxProps<Theme> =>
  (theme) => {
    const d = dash(theme);
    return {
      fontSize: 13,
      fontWeight: active ? 700 : 500,
      color: active ? (theme as AppTheme).app.text.primary : d.textMuted,
      textDecoration: "none",
      px: 1.35,
      py: 0.55,
      borderRadius: "8px",
      border: "none",
      background: active
        ? `linear-gradient(135deg, ${alpha(d.accentBlue, 0.32)} 0%, ${alpha(d.accentIndigo, 0.24)} 100%)`
        : "transparent",
      boxShadow: active ? `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.08)}` : "none",
      transition: "background-color 0.15s ease, color 0.15s ease",
      "&:hover": {
        color: (theme as AppTheme).app.text.primary,
        background: active
          ? `linear-gradient(135deg, ${alpha(d.accentBlue, 0.36)} 0%, ${alpha(d.accentIndigo, 0.28)} 100%)`
          : alpha(d.overlayLight, 0.35),
      },
    };
  };

export const chatLiveHeaderCardSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  const isLight = theme.palette.mode === "light";
  return {
    flexShrink: 0,
    px: { xs: 1.5, md: 2 },
    py: { xs: 1.25, md: 1.5 },
    borderRadius: "9.32px",
    border: `1px solid ${alpha(d.cardBorder, 0.3)}`,
    bgcolor: isLight ? "rgba(255, 255, 255, 0.12)" : "rgba(8, 12, 22, 0.2)",
    backdropFilter: d.cardBackdropBlur,
    WebkitBackdropFilter: d.cardBackdropBlur,
  };
};

export const chatLiveScopeChipSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    display: "inline-flex",
    alignItems: "center",
    px: 1,
    py: 0.35,
    borderRadius: "6px",
    fontSize: 11,
    fontWeight: 600,
    color: d.accentBlue,
    border: `1px solid ${alpha(d.accentBlue, 0.35)}`,
    bgcolor: alpha(d.accentBlue, 0.12),
    textTransform: "capitalize",
  };
};

export const chatLiveQueueStatPillSx = (
  variant: "active" | "waiting" | "closed",
): SxProps<Theme> => (theme) => {
  const d = dash(theme);
  const accent =
    variant === "waiting"
      ? d.accentOrange
      : variant === "closed"
        ? d.textMuted
        : d.accentBlue;
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    px: 1.15,
    py: 0.4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    color: (theme as AppTheme).app.text.primary,
    border: `1px solid ${alpha(accent, 0.35)}`,
    bgcolor: alpha(accent, 0.12),
  };
};

export const chatLivePaneHeaderSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    px: 1.75,
    py: 1,
    flexShrink: 0,
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.22)}`,
    bgcolor: alpha(d.headerBg, 0.5),
  };
};
