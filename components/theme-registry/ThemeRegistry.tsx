"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  APPEARANCE_PRESET_BY_ID,
  APPEARANCE_PRESETS,
  DEFAULT_APPEARANCE_PRESET_ID,
  PICK_COLOR_PRESET_ID,
} from "@/lib/theme/appearance-presets";
import { AppearanceContext } from "@/lib/theme/appearance-context";
import { mergeAppColors } from "@/lib/theme/merge-app-colors";
import { resolveAppearanceFromAccountBackgroundColor } from "@/lib/theme/account-theme";
import {
  DEFAULT_CUSTOM_ACCENT_HEX,
  getCustomAccentTheme,
  normalizeHex,
} from "@/lib/theme/custom-accent-theme";
import { useMounted } from "@/lib/ui/use-mounted";
import { createAppMuiTheme, defaultAppColors } from "@/theme/theme";

const STORAGE_KEY = "interchanges-appearance-preset";
const CUSTOM_HEX_KEY = "interchanges-appearance-custom-hex";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const [presetId, setPresetIdState] = useState(DEFAULT_APPEARANCE_PRESET_ID);
  const [customAccentHex, setCustomAccentHexState] = useState(DEFAULT_CUSTOM_ACCENT_HEX);

  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && APPEARANCE_PRESET_BY_ID[stored]) {
        setPresetIdState(stored);
      }
      const hex = localStorage.getItem(CUSTOM_HEX_KEY);
      if (hex) {
        setCustomAccentHexState(normalizeHex(hex));
      }
    } catch {
      /* ignore */
    }
  }, [mounted]);

  const setPresetId = useCallback((id: string) => {
    if (!APPEARANCE_PRESET_BY_ID[id]) return;
    setPresetIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const setCustomAccentHex = useCallback((hex: string) => {
    const next = normalizeHex(hex);
    setCustomAccentHexState(next);
    setPresetIdState(PICK_COLOR_PRESET_ID);
    try {
      localStorage.setItem(CUSTOM_HEX_KEY, next);
      localStorage.setItem(STORAGE_KEY, PICK_COLOR_PRESET_ID);
    } catch {
      /* ignore */
    }
  }, []);

  const applyAccountTheme = useCallback((backgroundColor: string | null | undefined) => {
    const resolved = resolveAppearanceFromAccountBackgroundColor(backgroundColor);
    if (!resolved) return;
    if (resolved.kind === "custom") {
      setCustomAccentHex(resolved.hex);
      return;
    }
    setPresetId(resolved.id);
  }, [setCustomAccentHex, setPresetId]);

  const activePresetId = mounted ? presetId : DEFAULT_APPEARANCE_PRESET_ID;
  const activeCustomHex = mounted ? customAccentHex : DEFAULT_CUSTOM_ACCENT_HEX;

  const preset =
    APPEARANCE_PRESET_BY_ID[activePresetId] ?? APPEARANCE_PRESET_BY_ID[DEFAULT_APPEARANCE_PRESET_ID];

  const muiTheme = useMemo(() => {
    let appBackground = preset.appBackground;
    let paletteMode = preset.paletteMode;
    let patch: Record<string, unknown> = preset.patch;

    if (preset.id === PICK_COLOR_PRESET_ID) {
      const custom = getCustomAccentTheme(activeCustomHex);
      appBackground = custom.appBackground;
      paletteMode = custom.paletteMode;
      patch = custom.patch;
    }

    const app = mergeAppColors(defaultAppColors, patch);
    return createAppMuiTheme(app, appBackground, paletteMode);
  }, [preset, activeCustomHex]);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    const bg =
      preset.id === PICK_COLOR_PRESET_ID
        ? getCustomAccentTheme(activeCustomHex).appBackground
        : preset.appBackground;
    document.body.style.background = bg;
  }, [mounted, preset.id, preset.appBackground, activeCustomHex]);

  const appearanceValue = useMemo(
    () => ({
      presetId,
      setPresetId,
      presets: APPEARANCE_PRESETS,
      customAccentHex,
      setCustomAccentHex,
      applyAccountTheme,
    }),
    [presetId, setPresetId, customAccentHex, setCustomAccentHex, applyAccountTheme]
  );

  return (
    <AppearanceContext.Provider value={appearanceValue}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppearanceContext.Provider>
  );
}
