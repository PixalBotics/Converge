"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createAppMuiTheme, defaultAppColors } from "@/theme/theme";
import {
  isDarkAppearanceBackground,
  resolveBodyTextForTheme,
} from "@/lib/theme/backgroundTextContrast";
import { mergeAppColors } from "@/lib/theme/merge-app-colors";
import { defaultDashboardAppearance } from "./defaults";
import { loadDashboardAppearanceFromStorage, saveDashboardAppearanceToStorage } from "./persist";
import { SHELL_GLASS_PRESETS } from "./shellGlassPresets";
import type {
  DashboardAppearance,
  DashboardAppearanceContextValue,
  DashboardContentUi,
  ShellGlassPreset,
  SidebarWidthPreset,
  TextMode,
} from "./types";

const DashboardAppearanceContext = createContext<DashboardAppearanceContextValue | null>(null);

export function DashboardAppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<DashboardAppearance>(defaultDashboardAppearance);
  const skipSaveUntilAfterHydrate = useRef(true);

  useEffect(() => {
    setAppearance(loadDashboardAppearanceFromStorage());
  }, []);

  useEffect(() => {
    if (skipSaveUntilAfterHydrate.current) {
      skipSaveUntilAfterHydrate.current = false;
      return;
    }
    saveDashboardAppearanceToStorage(appearance);
  }, [appearance]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--dashboard-bg", appearance.backgroundCss);
    document.body.style.background = appearance.backgroundCss;
    document.body.style.minHeight = "100vh";
  }, [appearance.backgroundCss]);

  const setBackgroundCss = useCallback((v: string) => {
    setAppearance((p) => ({ ...p, backgroundCss: v }));
  }, []);

  const setTextMode = useCallback((v: TextMode) => {
    setAppearance((p) => ({ ...p, textMode: v }));
  }, []);

  const setTextPrimaryHex = useCallback((v: string) => {
    setAppearance((p) => ({ ...p, textPrimaryHex: v }));
  }, []);

  const setTextSecondaryHex = useCallback((v: string) => {
    setAppearance((p) => ({ ...p, textSecondaryHex: v }));
  }, []);

  const setSidebarChrome = useCallback((patch: Partial<DashboardAppearance["sidebarChrome"]>) => {
    setAppearance((p) => ({ ...p, sidebarChrome: { ...p.sidebarChrome, ...patch } }));
  }, []);

  const setHeaderChrome = useCallback((patch: Partial<DashboardAppearance["headerChrome"]>) => {
    setAppearance((p) => ({ ...p, headerChrome: { ...p.headerChrome, ...patch } }));
  }, []);

  const setSidebarWidth = useCallback((v: SidebarWidthPreset) => {
    setAppearance((p) => ({ ...p, sidebarWidth: v }));
  }, []);

  const setShellGlassPreset = useCallback((preset: ShellGlassPreset) => {
    const pair = SHELL_GLASS_PRESETS[preset];
    setAppearance((p) => ({
      ...p,
      shellGlassPreset: preset,
      sidebarChrome: { ...p.sidebarChrome, ...pair.sidebar },
      headerChrome: { ...p.headerChrome, ...pair.header },
    }));
  }, []);

  const setAccents = useCallback((patch: Partial<DashboardAppearance["accents"]>) => {
    setAppearance((p) => ({ ...p, accents: { ...p.accents, ...patch } }));
  }, []);

  const setUi = useCallback((patch: Partial<DashboardContentUi>) => {
    setAppearance((p) => ({ ...p, ui: { ...p.ui, ...patch } }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setAppearance(defaultDashboardAppearance);
  }, []);

  const value = useMemo<DashboardAppearanceContextValue>(
    () => ({
      appearance,
      setBackgroundCss,
      setTextMode,
      setTextPrimaryHex,
      setTextSecondaryHex,
      setSidebarChrome,
      setHeaderChrome,
      setSidebarWidth,
      setShellGlassPreset,
      setAccents,
      setUi,
      resetToDefaults,
    }),
    [
      appearance,
      setBackgroundCss,
      setTextMode,
      setTextPrimaryHex,
      setTextSecondaryHex,
      setSidebarChrome,
      setHeaderChrome,
      setSidebarWidth,
      setShellGlassPreset,
      setAccents,
      setUi,
      resetToDefaults,
    ]
  );

  return <DashboardAppearanceContext.Provider value={value}>{children}</DashboardAppearanceContext.Provider>;
}

export function useDashboardAppearance(): DashboardAppearanceContextValue {
  const v = useContext(DashboardAppearanceContext);
  if (!v) {
    throw new Error("useDashboardAppearance must be used within DashboardAppearanceProvider");
  }
  return v;
}

export function useDashboardMuiTheme() {
  const { appearance } = useDashboardAppearance();
  return useMemo(() => {
    const { primaryHex, secondaryHex } = resolveBodyTextForTheme(
      appearance.backgroundCss,
      appearance.textMode,
      appearance.textPrimaryHex,
      appearance.textSecondaryHex
    );
    const paletteMode = isDarkAppearanceBackground(appearance.backgroundCss) ? "dark" : "light";
    const patch: Record<string, unknown> = {
      text: {
        primary: primaryHex,
        secondary: secondaryHex,
      },
    };
    const ui = appearance.ui;
    if (ui.mode === "manual") {
      const dashboard: Record<string, unknown> = {};
      if (ui.cardBgHex?.trim()) dashboard.cardBg = ui.cardBgHex.trim();
      if (ui.cardBorderHex?.trim()) dashboard.cardBorder = ui.cardBorderHex.trim();
      if (ui.dataAccentHex?.trim()) dashboard.accentBlue = ui.dataAccentHex.trim();
      if (Object.keys(dashboard).length > 0) patch.dashboard = dashboard;
    }
    const app = mergeAppColors(defaultAppColors, patch);
    return createAppMuiTheme(app, appearance.backgroundCss, paletteMode);
  }, [
    appearance.backgroundCss,
    appearance.textMode,
    appearance.textPrimaryHex,
    appearance.textSecondaryHex,
    appearance.ui,
  ]);
}
