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
  const cardBg = d.cardBg;
  const isGradientCardBg =
    typeof cardBg === "string" && /gradient/i.test(cardBg);
  return {
    width: "100%",
    maxWidth: 1200,
    mb: 1.5,
    p: { xs: 1.5, md: 2 },
    borderRadius: "12px",
    border: `1px solid ${alpha(d.cardBorder, 0.45)}`,
    background: isGradientCardBg
      ? cardBg
      : `linear-gradient(145deg, ${alpha(cardBg, 0.95)} 0%, ${alpha(d.liveChat.cardBg, 0.88)} 100%)`,
    boxShadow: `0 8px 32px ${alpha(d.cardBorder, 0.12)}`,
  };
};

export const guestCardSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    width: "100%",
    maxWidth: { xs: "100%", md: 1200 },
    flex: 1,
    display: "flex",
    flexDirection: "column",
    borderRadius: "12px",
    overflow: "hidden",
    minHeight: { xs: "calc(100dvh - 120px)", md: "calc(100dvh - 140px)" },
    maxHeight: { xs: "none", md: "calc(100dvh - 80px)" },
    border: `1px solid ${alpha(d.cardBorder, 0.5)}`,
    boxShadow: `0 12px 40px ${alpha(d.cardBorder, 0.14)}`,
    backdropFilter: "blur(8px)",
  };
};

export const guestBannerSx = chatOpsAlertBannerSx("info");

/** Main row: transcript (left) + supervisor tools (right). */
export const guestBodyRowSx: SxProps<Theme> = {
  display: "flex",
  flex: 1,
  minHeight: 0,
  flexDirection: { xs: "column", md: "row" },
  overflow: "hidden",
};

/** Transcript column — fills remaining width and scrolls messages. */
export const guestInboxColumnSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
};

/** Right supervisor sidebar (whisper above, takeover below). */
export const guestSupervisorSidebarSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    minHeight: 0,
    width: { xs: "100%", md: 340 },
    maxHeight: { xs: "42vh", md: "none" },
    overflowY: "auto",
    borderTop: { xs: `1px solid ${alpha(d.cardBorder, 0.5)}`, md: "none" },
    borderLeft: { xs: "none", md: `1px solid ${alpha(d.cardBorder, 0.5)}` },
  };
};

export const guestSupervisorGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 1.5,
  flex: 1,
  minHeight: 0,
  p: { xs: 1.5, md: 2 },
  alignContent: "start",
};

export const guestSupervisorColumnSx: SxProps<Theme> = (theme) => {
  const d = dash(theme);
  return {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    minWidth: 0,
    p: 1.25,
    borderRadius: "10px",
    border: `1px solid ${alpha(d.cardBorder, 0.35)}`,
    background: alpha(d.overlayLight, 0.35),
  };
};
