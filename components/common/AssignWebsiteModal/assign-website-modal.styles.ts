import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const assignWebsiteFormGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
  gap: 2,
};

export const assignWebsiteUserListCardSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: { xs: 1.5, sm: 2 },
    display: "flex",
    flexDirection: "column",
    gap: 2,
    bgcolor: alpha(t.app.dashboard.pillBg, 0.55),
    border: `1px solid ${t.app.dashboard.cardBorder}`,
    borderRadius: "12px",
  };
};

/** Purple gradient tile with “$” — matches User List header in design. */
export const assignWebsiteUserListIconSx: SxProps<Theme> = (theme) => {
  const d = (theme as AppTheme).app.dashboard;
  return {
    width: 44,
    height: 44,
    borderRadius: "12px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: d.gradientIcon,
    color: d.white95,
    fontWeight: 700,
    fontSize: "1.25rem",
    fontFamily: theme.typography.fontFamily,
    boxShadow: `0 8px 24px ${alpha(d.accentPurple, 0.45)}`,
  };
};
