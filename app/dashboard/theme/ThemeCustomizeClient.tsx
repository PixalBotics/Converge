"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { PaletteOutlined } from "@mui/icons-material";
import { useTheme, type SxProps, type Theme } from "@mui/material/styles";
import { Button, HoverTooltip, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useAppearance } from "@/lib/theme/appearance-context";
import { PICK_COLOR_PRESET_ID } from "@/lib/theme/appearance-presets";
import type { AppearancePreset } from "@/lib/theme/appearance-preset.types";
import { getCustomAccentTheme } from "@/lib/theme/custom-accent-theme";
import type { AppTheme } from "@/theme/theme";
import { resolveSx } from "@/utils/resolveSx";
import { ThemeAccentPickerPopover } from "./ThemeAccentPickerPopover";
import { ThemeSwatchButton } from "./ThemeSwatchButton";
import {
  getDefaultThemePresets,
  getSolidColorPresets,
  mutedStatusLineSx,
  pageSubtitleSx,
  pageTitleSx,
  pickerPaletteOutlinedIconSx,
  savedLineSx,
  sectionLabelSx,
  swatchFillInnerSx,
  unsavedAlertSx,
  saveActionButtonSx,
  ThemeColorPickerInner,
  ThemeColorPickerTrigger,
  ThemeCustomizeColorGrid,
  ThemeCustomizeDefaultRow,
  ThemeCustomizeRoot,
  ThemeCustomizeSwatchesRow,
} from "./styles";
import { useThemeAppearanceSave } from "./use-theme-appearance-save";

export default function ThemeCustomizeClient() {
  const theme = useTheme() as AppTheme;
  const { presetId, setPresetId, presets, customAccentHex, setCustomAccentHex } = useAppearance();
  const [hexDraft, setHexDraft] = useState(customAccentHex);
  const [colorPopoverAnchor, setColorPopoverAnchor] = useState<HTMLElement | null>(null);

  const { platformThemeQuery, syncedHex, needsSave, isSavingTheme, handleSaveTheme } = useThemeAppearanceSave(
    presetId,
    customAccentHex,
    { setPresetId, setCustomAccentHex },
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

  const swatchFill = useCallback(
    (p: AppearancePreset) => {
      if (p.id === PICK_COLOR_PRESET_ID) {
        return { background: getCustomAccentTheme(customAccentHex).appBackground };
      }
      return { background: p.appBackground };
    },
    [customAccentHex],
  );

  const pickSelected = presetId === PICK_COLOR_PRESET_ID;

  return (
    <ThemeCustomizeRoot>
      <Typography variant="boldLarge" sx={pageTitleSx}>
        Customize appearance
      </Typography>
      <Typography variant="medium" sx={pageSubtitleSx}>
        Choose a theme, then save so your accent syncs to your account (dashboard shell).
      </Typography>

      {platformThemeQuery.isLoading ? (
        <Typography variant="small" sx={mutedStatusLineSx}>
          Loading saved theme…
        </Typography>
      ) : platformThemeQuery.isError ? (
        <Typography variant="small" sx={mutedStatusLineSx}>
          Could not load saved theme; showing local settings.
        </Typography>
      ) : null}

      {syncedHex !== undefined && needsSave && (
        <Alert severity="warning" variant="outlined" sx={unsavedAlertSx}
          action={
            <Button
              type="button"
              variant="primary"
              size="small"
              disabled={isSavingTheme}
              onClick={handleSaveTheme}
              sx={
                {
                  ...resolveSx(gradientPrimaryButtonSx, theme),
                  ...resolveSx(saveActionButtonSx, theme),
                } as SxProps<Theme>
              }
            >
              {isSavingTheme ? "Saving…" : "Save to account"}
            </Button>
          }
        >
          Unsaved changes — your new colors are only on this device until you save.
        </Alert>
      )}

      {syncedHex !== undefined && !needsSave && !platformThemeQuery.isLoading && (
        <Typography variant="small" sx={savedLineSx}>
          Saved — dashboard matches your account.
        </Typography>
      )}

      {defaultThemePresets.length > 0 && (
        <ThemeCustomizeDefaultRow>
          <Typography variant="medium16" sx={sectionLabelSx}>
            Default theme
          </Typography>
          <ThemeCustomizeSwatchesRow>
            {defaultThemePresets.map((p) => (
              <HoverTooltip key={p.id} label={p.label} fullWidth={false}>
                <ThemeSwatchButton
                  shape="tile"
                  compact
                  selected={presetId === p.id}
                  onClick={() => setPresetId(p.id)}
                  ariaLabel={p.label}
                >
                  <Box sx={swatchFillInnerSx(theme, { shape: "tile", fill: swatchFill(p) })} />
                </ThemeSwatchButton>
              </HoverTooltip>
            ))}
          </ThemeCustomizeSwatchesRow>
        </ThemeCustomizeDefaultRow>
      )}

      <Typography variant="medium16" sx={sectionLabelSx}>
        Color themes
      </Typography>

      <ThemeCustomizeColorGrid>
        <HoverTooltip label="Custom color — open picker" fullWidth={false}>
          <ThemeColorPickerTrigger
            type="button"
            aria-label="Custom color — open picker"
            aria-haspopup="dialog"
            aria-expanded={Boolean(colorPopoverAnchor)}
            onClick={(e) => setColorPopoverAnchor(e.currentTarget)}
            $selected={pickSelected}
          >
            <ThemeColorPickerInner $hex={customAccentHex}>
              <PaletteOutlined inheritViewBox sx={pickerPaletteOutlinedIconSx(theme)} />
            </ThemeColorPickerInner>
          </ThemeColorPickerTrigger>
        </HoverTooltip>

        {solidColorPresets.map((p) => (
          <HoverTooltip key={p.id} label={p.label}>
            <ThemeSwatchButton
              shape="circle"
              selected={p.id === presetId}
              onClick={() => setPresetId(p.id)}
              ariaLabel={p.label}
            >
              <Box sx={swatchFillInnerSx(theme, { shape: "circle", fill: swatchFill(p) })} />
            </ThemeSwatchButton>
          </HoverTooltip>
        ))}
      </ThemeCustomizeColorGrid>

      <ThemeAccentPickerPopover
        theme={theme}
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
