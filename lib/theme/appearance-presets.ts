import type { AppearancePreset } from "./appearance-preset.types";
import { DISCORD_NITRO_PRESETS, lightDashboardShell } from "./discord-nitro-presets";

export type { AppearancePreset } from "./appearance-preset.types";

/** Shown in the “Default theme” row (Discord dark + white + grey). */
export const DEFAULT_THEME_GROUP_IDS = ["default", "default-white", "default-grey"] as const;

export const APPEARANCE_PRESETS: AppearancePreset[] = [
  {
    id: "default",
    label: "Discord",
    previewBar: "#5865f2",
    previewTab: "#2b2d31",
    appBackground: "linear-gradient(180deg, #050508 0%, #0a0a2c 100%)",
    paletteMode: "dark",
    patch: {
      dashboard: {
        headerBorderGradient: "linear-gradient(90deg, #202225 0%, #5865f2 100%)",
        sidebarBg: "#2b2d31",
        headerBg: "#1e1f22",
        contentBg: "linear-gradient(180deg, #1e1f22 0%, #2b2d31 100%)",
        cardBg:
          "linear-gradient(165deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 38%, rgba(255,255,255,0) 52%), linear-gradient(210deg, rgba(255,255,255,0.05) 0%, transparent 55%), rgba(26, 28, 36, 0.36)",
        cardBackdropBlur: "blur(28px) saturate(170%)",
        cardBorder: "rgba(255, 255, 255, 0.22)",
        navItemSelectedBg: "rgba(88, 101, 242, 0.22)",
        navActiveBg: "rgba(88, 101, 242, 0.24)",
        accentBlue: "#5865f2",
        menuSurfaceBg: "#1e1f22",
        pillBg: "#2b2d31",
        pillActive: "#1e1f22",
        liveChat: {
          cardBg: "#2b2d31",
          messageBg: "#313338",
          avatarBg: "#5865f2",
          messageText: "rgba(248, 250, 252, 0.9)",
          cardGlass: "rgba(244, 244, 244, 0.02)",
        },
      },
    },
  },
  {
    id: "default-white",
    label: "White",
    previewBar: "#ffffff",
    previewTab: "#e2e8f0",
    appBackground: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    paletteMode: "light",
    patch: lightDashboardShell({
      sidebar: "#f1f5f9",
      header: "#ffffff",
      top: "#ffffff",
      bot: "#f8fafc",
      border: "linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)",
      accent: "#5865f2",
      card: "rgba(255, 255, 255, 0.95)",
      cardBorder: "rgba(15, 23, 42, 0.08)",
    }),
  },
  {
    id: "default-grey",
    label: "Grey",
    previewBar: "#e3e5e8",
    previewTab: "#949ba4",
    appBackground: "linear-gradient(180deg, #e3e5e8 0%, #c9ccd1 100%)",
    paletteMode: "light",
    patch: lightDashboardShell({
      sidebar: "#d1d5db",
      header: "#e3e5e8",
      top: "#ebedef",
      bot: "#d1d5db",
      border: "linear-gradient(90deg, #9ca3af 0%, #6b7280 100%)",
      accent: "#475569",
      card: "rgba(255, 255, 255, 0.9)",
      cardBorder: "rgba(15, 23, 42, 0.1)",
    }),
  },
  {
    id: "pick-color",
    label: "Custom color",
    previewBar: "#cbd5e1",
    previewTab: "#f472b6",
    appBackground: "linear-gradient(180deg, #050508 0%, #0a0a2c 100%)",
    paletteMode: "dark",
    patch: {
      dashboard: {
        accentBlue: "#ec4899",
        accentPurple: "#f472b6",
        navActiveBg: "rgba(236, 72, 153, 0.22)",
      },
    },
  },
  ...DISCORD_NITRO_PRESETS,
];

export const APPEARANCE_PRESET_BY_ID = Object.fromEntries(
  APPEARANCE_PRESETS.map((p) => [p.id, p])
) as Record<string, AppearancePreset>;

export const DEFAULT_APPEARANCE_PRESET_ID = "default";

export const PICK_COLOR_PRESET_ID = "pick-color";
