"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppearance } from "@/lib/theme/appearance-context";
import { PICK_COLOR_PRESET_ID } from "@/lib/theme/appearance-presets";
import type { AppearancePreset } from "@/lib/theme/appearance-preset.types";
import { getCustomAccentTheme } from "@/lib/theme/custom-accent-theme";
import { HoverTooltip } from "@/components/common";
import { ThemeAccentPickerPopover } from "./ThemeAccentPickerPopover";
import { ThemeSwatchButton } from "./ThemeSwatchButton";
import { getDefaultThemePresets, getSolidColorPresets } from "./styles/theme-appearance.presets";
import {
  ThemeColorPickerInner,
  ThemeColorPickerTrigger,
  ThemeCustomizeColorGrid,
  ThemeCustomizeDefaultRow,
  ThemeCustomizeRoot,
  ThemeCustomizeSwatchesRow,
  ThemePageSubtitle,
  ThemePageTitle,
  ThemePaletteIcon,
  ThemeSaveAccountButton,
  ThemeSavedLine,
  ThemeSectionLabel,
  ThemeStatusLine,
  ThemeUnsavedAlert,
} from "./styles/theme-customize.styled";
import { useThemeAppearanceSave } from "./use-theme-appearance-save";

export default function ThemeCustomizeClient() {
  const { presetId, setPresetId, presets, customAccentHex, setCustomAccentHex } = useAppearance();
  const [hexDraft, setHexDraft] = useState(customAccentHex);
  const [colorPopoverAnchor, setColorPopoverAnchor] = useState<HTMLElement | null>(null);

  const { platformThemeQuery, syncedHex, needsSave, isSavingTheme, handleSaveTheme } = useThemeAppearanceSave(
    presetId,
    customAccentHex,
  );

  const defaultThemePresets = useMemo(() => getDefaultThemePresets(presets), [presets]);
  const solidColorPresets = useMemo(() => getSolidColorPresets(presets), [presets]);

  useEffect(() => {
    setHexDraft(customAccentHex);
  }, [customAccentHex]);

  const onHexBlur = useCallback(() => {
    setCustomAccentHex(hexDraft);
  }, [hexDraft, setCustomAccentHex]);

  const closeColorPopover = useCallback(() => {
    setColorPopoverAnchor(null);
    onHexBlur();
  }, [onHexBlur]);

  const swatchBackground = useCallback(
    (p: AppearancePreset) => {
      if (p.id === PICK_COLOR_PRESET_ID) {
        return getCustomAccentTheme(customAccentHex).appBackground;
      }
      return p.appBackground;
    },
    [customAccentHex],
  );

  const pickSelected = presetId === PICK_COLOR_PRESET_ID;

  return (
    <ThemeCustomizeRoot>
      <ThemePageTitle variant="boldLarge">Customize appearance</ThemePageTitle>
      <ThemePageSubtitle variant="medium">
        Choose a theme, then save so your accent syncs to your account (dashboard shell).
      </ThemePageSubtitle>

      {platformThemeQuery.isLoading ? (
        <ThemeStatusLine variant="small">Loading saved theme…</ThemeStatusLine>
      ) : platformThemeQuery.isError ? (
        <ThemeStatusLine variant="small">Could not load saved theme; showing local settings.</ThemeStatusLine>
      ) : null}

      {syncedHex !== undefined && needsSave && (
        <ThemeUnsavedAlert
          severity="warning"
          variant="outlined"
          action={
            <ThemeSaveAccountButton
              type="button"
              variant="primary"
              size="small"
              disabled={isSavingTheme}
              onClick={handleSaveTheme}
            >
              {isSavingTheme ? "Saving…" : "Save to account"}
            </ThemeSaveAccountButton>
          }
        >
          Unsaved changes — your new colors are only on this device until you save.
        </ThemeUnsavedAlert>
      )}

      {syncedHex !== undefined && !needsSave && !platformThemeQuery.isLoading && (
        <ThemeSavedLine variant="small">Saved — dashboard matches your account.</ThemeSavedLine>
      )}

      {defaultThemePresets.length > 0 && (
        <ThemeCustomizeDefaultRow>
          <ThemeSectionLabel variant="medium16">Default theme</ThemeSectionLabel>
          <ThemeCustomizeSwatchesRow>
            {defaultThemePresets.map((p) => (
              <HoverTooltip key={p.id} label={p.label} fullWidth={false}>
                <ThemeSwatchButton
                  shape="tile"
                  compact
                  selected={presetId === p.id}
                  onClick={() => setPresetId(p.id)}
                  ariaLabel={p.label}
                  background={swatchBackground(p)}
                />
              </HoverTooltip>
            ))}
          </ThemeCustomizeSwatchesRow>
        </ThemeCustomizeDefaultRow>
      )}

      <ThemeSectionLabel variant="medium16">Color themes</ThemeSectionLabel>

      <ThemeCustomizeColorGrid>
        <HoverTooltip label="Custom color — open picker" fullWidth>
          <ThemeColorPickerTrigger
            type="button"
            aria-label="Custom color — open picker"
            aria-haspopup="dialog"
            aria-expanded={Boolean(colorPopoverAnchor)}
            onClick={(e) => setColorPopoverAnchor(e.currentTarget)}
            $selected={pickSelected}
          >
            <ThemeColorPickerInner>
              <ThemePaletteIcon />
            </ThemeColorPickerInner>
          </ThemeColorPickerTrigger>
        </HoverTooltip>

        {solidColorPresets.map((p) => (
          <HoverTooltip key={p.id} label={p.label} fullWidth>
            <ThemeSwatchButton
              shape="circle"
              selected={p.id === presetId}
              onClick={() => setPresetId(p.id)}
              ariaLabel={p.label}
              background={swatchBackground(p)}
            />
          </HoverTooltip>
        ))}
      </ThemeCustomizeColorGrid>

      <ThemeAccentPickerPopover
        open={Boolean(colorPopoverAnchor)}
        anchorEl={colorPopoverAnchor}
        onClose={closeColorPopover}
        customAccentHex={customAccentHex}
        setCustomAccentHex={setCustomAccentHex}
        hexDraft={hexDraft}
        setHexDraft={setHexDraft}
        onHexBlur={onHexBlur}
      />
    </ThemeCustomizeRoot>
  );
}
