import { APPEARANCE_PRESET_BY_ID, PICK_COLOR_PRESET_ID } from "@/lib/theme/appearance-presets";
import { normalizeHex } from "@/lib/theme/custom-accent-theme";
import { relativeLuminance } from "@/lib/theme/backgroundTextContrast";
import type { AppTheme } from "@/theme/theme";
import { alpha } from "@mui/material/styles";

export function persistBackgroundColorHex(presetId: string, customAccentHex: string): string {
  if (presetId === PICK_COLOR_PRESET_ID) {
    return normalizeHex(customAccentHex);
  }
  const preset = APPEARANCE_PRESET_BY_ID[presetId];
  return preset ? normalizeHex(preset.previewBar) : normalizeHex(customAccentHex);
}

export function parseBackgroundColor(raw: unknown): string | null {
  if (raw == null || String(raw).trim() === "") return null;
  return normalizeHex(String(raw));
}

/** Icon ink on a solid accent fill — uses theme tokens for fallbacks. */
export function inkOnAccentHex(hex: string, theme: AppTheme): string {
  const h = normalizeHex(hex).slice(1);
  if (h.length !== 6) return theme.app.text.primary;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const L = relativeLuminance({ r, g, b });
  return L > 0.5
    ? alpha(theme.palette.grey[900], 0.92)
    : theme.app.text.primary;
}
