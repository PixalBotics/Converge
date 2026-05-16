import { DEFAULT_THEME_GROUP_IDS, PICK_COLOR_PRESET_ID } from "@/lib/theme/appearance-presets";
import type { AppearancePreset } from "@/lib/theme/appearance-preset.types";

const defaultIdSet = new Set<string>(DEFAULT_THEME_GROUP_IDS);

export function getDefaultThemePresets(presets: AppearancePreset[]): AppearancePreset[] {
  return DEFAULT_THEME_GROUP_IDS.map((id) => presets.find((p) => p.id === id)).filter(
    (p): p is AppearancePreset => p != null,
  );
}

export function getSolidColorPresets(presets: AppearancePreset[]): AppearancePreset[] {
  return presets.filter((p) => !defaultIdSet.has(p.id) && p.id !== PICK_COLOR_PRESET_ID);
}
