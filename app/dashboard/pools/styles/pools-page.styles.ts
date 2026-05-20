import type { AppTheme } from "@/theme/theme";

/** Scroll cap for “add pool member” user picker table in the hub modal. */
export const HUB_ADD_USER_TABLE_MAX_PX = 360;

export const hubUserCheckboxSx = (theme: AppTheme) => ({
  color: theme.app.dashboard.textMuted,
  "&.Mui-checked": { color: "#2dd4bf" },
});
