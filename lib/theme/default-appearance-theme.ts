import {
  APPEARANCE_PRESET_BY_ID,
  DEFAULT_APPEARANCE_PRESET_ID,
} from "@/lib/theme/appearance-presets";
import { mergeAppColors } from "@/lib/theme/merge-app-colors";
import { createAppMuiTheme, defaultAppColors } from "@/theme/theme";

const preset = APPEARANCE_PRESET_BY_ID[DEFAULT_APPEARANCE_PRESET_ID];

/** Same MUI theme as `ThemeRegistry` when preset is the built-in Default (ignores saved appearance). */
export const defaultAppearanceMuiTheme = createAppMuiTheme(
  mergeAppColors(defaultAppColors, preset.patch),
  preset.appBackground,
  preset.paletteMode
);
