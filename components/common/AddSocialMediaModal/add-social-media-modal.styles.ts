import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const addSocialMediaFormGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
  gap: 2,
};

export const addSocialMediaPlatformCardSx = (theme: Theme, selected: boolean): SxProps<Theme> => {
  const t = theme as AppTheme;
  return {
    p: 2,
    borderRadius: "12px",
    border: `1px solid ${selected ? alpha(t.palette.primary.main, 0.55) : t.app.dashboard.cardBorder}`,
    bgcolor: alpha(t.app.dashboard.pillBg, 0.35),
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    transition: "border-color 0.2s ease",
  };
};

export const addSocialMediaPlatformIconWrapSx: SxProps<Theme> = {
  width: 44,
  height: 44,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

export const addSocialMediaFacebookFieldsSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
  gap: 2,
  width: "100%",
};
