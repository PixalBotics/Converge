import { defaultDashboardAppearance } from "./defaults";
import type { DashboardAppearance } from "./types";
import { parseStoredDashboardAppearance } from "./persist";

/**
 * When your backend sends partial theme JSON (or nothing yet), merge with defaults so the UI always has a full theme.
 *
 * Example body shape (all fields optional):
 * ```json
 * {
 *   "backgroundCss": "linear-gradient(180deg, #020617 0%, #000 100%)",
 *   "textMode": "auto",
 *   "textPrimaryHex": "#F8FAFC",
 *   "textSecondaryHex": "#94A3B8",
 *   "sidebarWidth": "standard",
 *   "shellGlassPreset": "medium",
 *   "sidebarChrome": { "blurPx": 28, "fillOpacity": 0.4, "tintHex": "#0B1220", "borderOpacity": 0.11 },
 *   "headerChrome": { "blurPx": 22, "fillOpacity": 0.42, "tintHex": "#0F172A", "borderOpacity": 0.1 },
 *   "accents": {
 *     "navLabelHex": "#A5B4FC",
 *     "navItemHex": "#C4B5FD",
 *     "navActiveIconHex": "#93C5FD",
 *     "searchFillOpacity": 0.08,
 *     "searchBorderOpacity": 0.14
 *   },
 *   "ui": {
 *     "mode": "auto",
 *     "cardBgHex": "rgba(255,255,255,0.07)",
 *     "cardBorderHex": "rgba(148,163,184,0.18)",
 *     "dataAccentHex": "#818CF8"
 *   }
 * }
 * ```
 */
export function mergeDashboardAppearanceFromApi(
  partial: Partial<DashboardAppearance> | null | undefined
): DashboardAppearance {
  if (!partial || typeof partial !== "object") return defaultDashboardAppearance;
  try {
    return parseStoredDashboardAppearance(
      JSON.stringify({ ...defaultDashboardAppearance, ...partial })
    );
  } catch {
    return defaultDashboardAppearance;
  }
}
