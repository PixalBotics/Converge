import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { isSimpleCssColor, safeAlpha } from "@/lib/theme/safe-alpha";

export { isSimpleCssColor, safeAlpha };

function dash(theme: Theme) {
  return (theme as AppTheme).app.dashboard;
}

/** Solid dashboard fill when `cardBg` is a glass gradient string. */
export function dashboardSolidSurface(theme: Theme): string {
  const d = dash(theme);
  const candidates = [d.sidebarBg, d.headerBg, d.pillBg, d.menuSurfaceBg];
  for (const c of candidates) {
    if (typeof c === "string" && isSimpleCssColor(c)) return c;
  }
  return theme.palette.background.paper;
}

/** Card/shell background — gradient `cardBg` or alpha-safe solid. */
export function dashboardCardFill(theme: Theme, opacity = 0.88): string | undefined {
  const d = dash(theme);
  if (typeof d.cardBg === "string" && d.cardBg.includes("gradient")) {
    return undefined;
  }
  if (isSimpleCssColor(d.cardBg)) {
    return alpha(d.cardBg, opacity);
  }
  return alpha(dashboardSolidSurface(theme), opacity);
}

export function dashboardCardSurfaceProps(
  theme: Theme,
  opacity = 0.88,
): {
  bgcolor?: string;
  background?: string;
  backdropFilter?: string;
  WebkitBackdropFilter?: string;
} {
  const d = dash(theme);
  if (typeof d.cardBg === "string" && d.cardBg.includes("gradient")) {
    return {
      background: d.cardBg,
      backdropFilter: d.cardBackdropBlur,
      WebkitBackdropFilter: d.cardBackdropBlur,
    };
  }
  const fill = dashboardCardFill(theme, opacity);
  return fill ? { bgcolor: fill } : { bgcolor: dashboardSolidSurface(theme) };
}

export type ChatSemanticTone = "canned" | "ai" | "whisper" | "info" | "warning" | "muted";

function accentForTone(theme: AppTheme, tone: ChatSemanticTone): string {
  const d = theme.app.dashboard;
  switch (tone) {
    case "canned":
    case "info":
      return d.accentBlue;
    case "ai":
      return d.accentPurple;
    case "whisper":
      return d.accentViolet;
    case "warning":
      return theme.palette.warning.main;
    case "muted":
    default:
      return d.textMuted;
  }
}

/** Theme-safe tinted surface for tool panels, alerts, and chips. */
export function chatSemanticSurface(theme: AppTheme, tone: ChatSemanticTone) {
  const accent = accentForTone(theme, tone);
  const d = theme.app.dashboard;
  return {
    accent,
    border: `1px solid ${alpha(accent, tone === "muted" ? 0.22 : 0.38)}`,
    bgcolor: alpha(accent, tone === "muted" ? 0.06 : 0.12),
    headerBg: alpha(accent, tone === "muted" ? 0.04 : 0.1),
    labelColor: tone === "muted" ? d.textMuted : accent,
  };
}
