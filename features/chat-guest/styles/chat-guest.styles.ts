import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { chatOpsAlertBannerSx } from "@/features/chat-operations/styles/chat-operations.styles";

function dash(theme: Theme) {
  return (theme as AppTheme).app.dashboard;
}

export const guestPageShellSx: SxProps<Theme> = (theme) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  py: { xs: 2, md: 4 },
  px: { xs: 1.5, md: 3 },
  background: `linear-gradient(180deg, ${alpha(dash(theme).headerBg, 0.5)} 0%, ${alpha(dash(theme).sidebarBg, 0.35)} 100%)`,
});

export const guestHeaderCardSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    width: "100%",
    maxWidth: 960,
    mb: 1.5,
    p: { xs: 1.5, md: 2 },
    borderRadius: "12px",
    border: `1px solid ${alpha(d.cardBorder, 0.45)}`,
    background: `linear-gradient(145deg, ${alpha(d.cardBg, 0.95)} 0%, ${alpha(d.liveChat.cardBg, 0.88)} 100%)`,
    boxShadow: `0 8px 32px ${alpha(d.cardBorder, 0.12)}`,
  };
};

export const guestCardSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    width: "100%",
    maxWidth: 960,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    borderRadius: "12px",
    overflow: "hidden",
    minHeight: { xs: "calc(100vh - 32px)", md: 640 },
    maxHeight: { xs: "none", md: "calc(100vh - 64px)" },
    border: `1px solid ${alpha(d.cardBorder, 0.5)}`,
    boxShadow: `0 12px 40px ${alpha(d.cardBorder, 0.14)}`,
    backdropFilter: "blur(8px)",
  };
};

export const guestBannerSx = chatOpsAlertBannerSx("info");
