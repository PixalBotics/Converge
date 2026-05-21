import type { SxProps, Theme } from "@mui/material/styles";

export const guestPageShellSx: SxProps<Theme> = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  py: { xs: 2, md: 4 },
  px: { xs: 1.5, md: 3 },
};

export const guestCardSx: SxProps<Theme> = {
  width: "100%",
  maxWidth: 960,
  flex: 1,
  display: "flex",
  flexDirection: "column",
  borderRadius: 3,
  overflow: "hidden",
  minHeight: { xs: "calc(100vh - 32px)", md: 640 },
  maxHeight: { xs: "none", md: "calc(100vh - 64px)" },
};

export const guestBannerSx: SxProps<Theme> = (theme) => ({
  px: 2,
  py: 1,
  flexShrink: 0,
  borderBottom: `1px solid ${theme.app.dashboard.cardBorder}`,
  bgcolor: theme.app.dashboard.overlayLight,
});
