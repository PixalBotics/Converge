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
  gap: { xs: 1.5, md: 2 },
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

export const chatLiveFilterGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
    xl: "repeat(4, 1fr)",
  },
  gap: 1.25,
  alignItems: "start",
};

export const chatLiveNavRowSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.25,
  alignItems: "center",
};

export const chatLiveNavLinkSx =
  (active: boolean): SxProps<Theme> =>
  (theme) => {
    const d = dash(theme);
    return {
      fontSize: 13,
      fontWeight: active ? 700 : 500,
      color: active ? d.accentBlue : theme.app.dashboard.textMuted,
      textDecoration: "none",
      px: 1,
      py: 0.35,
      borderRadius: 1,
      borderBottom: active ? `2px solid ${d.accentBlue}` : "2px solid transparent",
      "&:hover": { color: theme.app.text.primary },
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
