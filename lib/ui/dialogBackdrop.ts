import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

/**
 * Full-page scrim behind dialogs: dims content and picks up the active accent
 * (`theme.palette.primary` mirrors `app.dashboard.accentBlue` from presets + custom pick).
 */
export function dialogBackdropBackground(theme: Theme): string {
  const accent = theme.palette.primary.main;
  if (theme.palette.mode === "light") {
    return `linear-gradient(180deg, ${alpha(accent, 0.12)} 0%, ${alpha("#0f172a", 0.4)} 100%)`;
  }
  return `radial-gradient(95% 72% at 50% -18%, ${alpha(accent, 0.4)} 0%, transparent 58%),
    linear-gradient(180deg, ${alpha("#020617", 0.7)} 0%, ${alpha("#000000", 0.82)} 100%)`;
}
