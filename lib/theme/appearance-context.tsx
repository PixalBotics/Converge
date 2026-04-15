"use client";

import { createContext, useContext } from "react";
import type { AppearancePreset } from "./appearance-presets";

export type AppearanceContextValue = {
  presetId: string;
  setPresetId: (id: string) => void;
  presets: AppearancePreset[];
  customAccentHex: string;
  setCustomAccentHex: (hex: string) => void;
};

export const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function useAppearance() {
  const v = useContext(AppearanceContext);
  if (!v) {
    throw new Error("useAppearance must be used within ThemeRegistry");
  }
  return v;
}
