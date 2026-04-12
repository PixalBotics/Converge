import type { AppearancePreset } from "./appearance-preset.types";

const lightText = {
  primary: "#0f172a",
  secondary: "rgba(51, 65, 85, 0.88)",
  link: "rgba(30, 58, 138, 0.95)",
  or: "rgba(71, 85, 105, 0.85)",
  placeholder: "#64748b",
  iconMuted: "rgba(15, 23, 42, 0.55)",
};

/** Shared by Nitro pastels + default white/grey themes */
export const lightDashboardShell = (opts: {
  sidebar: string;
  header: string;
  top: string;
  bot: string;
  border: string;
  accent: string;
  card: string;
  cardBorder: string;
}) => ({
  text: lightText,
  border: {
    divider: "rgba(15, 23, 42, 0.12)",
    input: "rgba(15, 23, 42, 0.2)",
    inputFocus: "rgba(37, 99, 235, 0.45)",
  },
  dashboard: {
    headerBorderGradient: opts.border,
    textSubtleMuted: "rgba(15, 23, 42, 0.55)",
    sidebarBg: opts.sidebar,
    headerBg: opts.header,
    contentBg: `linear-gradient(180deg, ${opts.top} 0%, ${opts.bot} 100%)`,
    cardBg: opts.card,
    cardBorder: opts.cardBorder,
    navItemSelectedBg: `${opts.accent}26`,
    navActiveBg: `${opts.accent}30`,
    accentBlue: opts.accent,
    menuSurfaceBg: opts.header,
    searchChromeBorder: "rgba(15, 23, 42, 0.12)",
    textMuted: "rgba(51, 65, 85, 0.85)",
    textMuted95: "rgba(51, 65, 85, 0.92)",
    white60: "rgba(15, 23, 42, 0.55)",
    white65: "rgba(15, 23, 42, 0.6)",
    white7: "rgba(15, 23, 42, 0.65)",
    white80: "rgba(15, 23, 42, 0.78)",
    white90: "rgba(15, 23, 42, 0.88)",
    white95: "rgba(15, 23, 42, 0.94)",
    iconMuted: "rgba(51, 65, 85, 0.75)",
    pillBg: opts.top,
    pillActive: opts.sidebar,
    overlayLight: "rgba(15, 23, 42, 0.04)",
    overlayMedium: "rgba(15, 23, 42, 0.06)",
    gradientButtonText: "rgba(248, 250, 252, 0.98)",
  },
});

const darkShell = (opts: {
  appBackground?: string;
  sidebar: string;
  header: string;
  top: string;
  bot: string;
  border: string;
  accent: string;
  card: string;
}) => {
  const appBackground =
    opts.appBackground ??
    `linear-gradient(135deg, ${opts.top} 0%, ${opts.bot} 100%)`;
  return {
    appBackground,
    paletteMode: "dark" as const,
    patch: {
      dashboard: {
        headerBorderGradient: opts.border,
        sidebarBg: opts.sidebar,
        headerBg: opts.header,
        contentBg: `linear-gradient(180deg, ${opts.top} 0%, ${opts.bot} 100%)`,
        cardBg: opts.card,
        cardBorder: "rgba(255, 255, 255, 0.1)",
        navItemSelectedBg: `${opts.accent}35`,
        navActiveBg: `${opts.accent}33`,
        accentBlue: opts.accent,
        menuSurfaceBg: opts.header,
        pillBg: opts.sidebar,
        pillActive: opts.header,
        liveChat: {
          cardBg: opts.header,
          messageBg: opts.sidebar,
          avatarBg: opts.accent,
          messageText: "rgba(248, 250, 252, 0.9)",
          cardGlass: "rgba(244, 244, 244, 0.02)",
        },
      },
    },
  };
};

/**
 * Discord Nitro–style color themes (pastel row + deep row + jewel row).
 * Order matches the Appearance grid: pick-color is separate; these are the 22 gradient tiles.
 */
export const DISCORD_NITRO_PRESETS: AppearancePreset[] = [
  // Row 1 — pastels (light dashboard chrome)
  {
    id: "nitro-mint-lime",
    label: "Mint lime",
    previewBar: "#c8f0d0",
    previewTab: "#a3e635",
    appBackground: "linear-gradient(135deg, #c8f0d0 0%, #e8f0a8 100%)",
    paletteMode: "light",
    patch: lightDashboardShell({
      sidebar: "#d4f4dd",
      header: "#ecfdf5",
      top: "#ecfdf5",
      bot: "#d4f4dd",
      border: "linear-gradient(90deg, #86efac 0%, #bef264 100%)",
      accent: "#15803d",
      card: "rgba(255, 255, 255, 0.92)",
      cardBorder: "rgba(21, 128, 61, 0.12)",
    }),
  },
  {
    id: "nitro-peach",
    label: "Peach",
    previewBar: "#ffd4c9",
    previewTab: "#fb923c",
    appBackground: "linear-gradient(135deg, #ffd4c9 0%, #ffe8a8 100%)",
    paletteMode: "light",
    patch: lightDashboardShell({
      sidebar: "#ffe4d9",
      header: "#fff7ed",
      top: "#fff7ed",
      bot: "#ffe4d9",
      border: "linear-gradient(90deg, #fdba74 0%, #fbbf24 100%)",
      accent: "#c2410c",
      card: "rgba(255, 255, 255, 0.92)",
      cardBorder: "rgba(194, 65, 12, 0.1)",
    }),
  },
  {
    id: "nitro-lavender-sky",
    label: "Lavender sky",
    previewBar: "#e8d4f8",
    previewTab: "#93c5fd",
    appBackground: "linear-gradient(135deg, #e8d4f8 0%, #c8e8ff 100%)",
    paletteMode: "light",
    patch: lightDashboardShell({
      sidebar: "#ede9fe",
      header: "#faf5ff",
      top: "#faf5ff",
      bot: "#ede9fe",
      border: "linear-gradient(90deg, #c4b5fd 0%, #93c5fd 100%)",
      accent: "#6d28d9",
      card: "rgba(255, 255, 255, 0.92)",
      cardBorder: "rgba(109, 40, 217, 0.1)",
    }),
  },
  {
    id: "nitro-cream-sage",
    label: "Cream sage",
    previewBar: "#e8e4d8",
    previewTab: "#a3b8a0",
    appBackground: "linear-gradient(135deg, #f5f0e0 0%, #d8e8d0 100%)",
    paletteMode: "light",
    patch: lightDashboardShell({
      sidebar: "#e8e8dc",
      header: "#f5f5f0",
      top: "#f7f7f2",
      bot: "#e8e8dc",
      border: "linear-gradient(90deg, #a8c4a0 0%, #86a882 100%)",
      accent: "#3f6212",
      card: "rgba(255, 255, 255, 0.9)",
      cardBorder: "rgba(63, 98, 18, 0.1)",
    }),
  },
  {
    id: "nitro-mauve-gold",
    label: "Mauve gold",
    previewBar: "#e8d0e8",
    previewTab: "#e8c860",
    appBackground: "linear-gradient(135deg, #e8d0e8 0%, #f0e0a8 100%)",
    paletteMode: "light",
    patch: lightDashboardShell({
      sidebar: "#edd8ed",
      header: "#faf5fa",
      top: "#faf5fa",
      bot: "#edd8ed",
      border: "linear-gradient(90deg, #d946ef 0%, #eab308 100%)",
      accent: "#a21caf",
      card: "rgba(255, 255, 255, 0.92)",
      cardBorder: "rgba(162, 28, 175, 0.1)",
    }),
  },
  {
    id: "nitro-lilac-mist",
    label: "Lilac mist",
    previewBar: "#e8e0ff",
    previewTab: "#e0e8ff",
    appBackground: "linear-gradient(135deg, #e8e0ff 0%, #f0f8ff 100%)",
    paletteMode: "light",
    patch: lightDashboardShell({
      sidebar: "#e8e8fc",
      header: "#f5f5ff",
      top: "#f8f8ff",
      bot: "#e8e8fc",
      border: "linear-gradient(90deg, #a5b4fc 0%, #bfdbfe 100%)",
      accent: "#4f46e5",
      card: "rgba(255, 255, 255, 0.92)",
      cardBorder: "rgba(79, 70, 229, 0.1)",
    }),
  },
  {
    id: "nitro-turquoise",
    label: "Turquoise",
    previewBar: "#c8f8f0",
    previewTab: "#ffffff",
    appBackground: "linear-gradient(135deg, #c8f8f0 0%, #ffffff 100%)",
    paletteMode: "light",
    patch: lightDashboardShell({
      sidebar: "#d4fbf4",
      header: "#f0fdfa",
      top: "#f0fdfa",
      bot: "#d4fbf4",
      border: "linear-gradient(90deg, #5eead4 0%, #99f6e4 100%)",
      accent: "#0f766e",
      card: "rgba(255, 255, 255, 0.94)",
      cardBorder: "rgba(15, 118, 110, 0.1)",
    }),
  },
  {
    id: "nitro-warm-beige",
    label: "Warm beige",
    previewBar: "#f0e8d8",
    previewTab: "#e8dcc8",
    appBackground: "linear-gradient(135deg, #f5f0e8 0%, #f0e8d8 100%)",
    paletteMode: "light",
    patch: lightDashboardShell({
      sidebar: "#ebe4d8",
      header: "#faf8f5",
      top: "#faf8f5",
      bot: "#ebe4d8",
      border: "linear-gradient(90deg, #d6d3d1 0%, #a8a29e 100%)",
      accent: "#57534e",
      card: "rgba(255, 255, 255, 0.9)",
      cardBorder: "rgba(87, 83, 78, 0.12)",
    }),
  },
  // Row 2 — deep & rich
  {
    id: "nitro-sunset-purple",
    label: "Sunset",
    previewBar: "#6b2d8f",
    previewTab: "#e87840",
    ...darkShell({
      sidebar: "#4a1d6b",
      header: "#5c2d7a",
      top: "#7c3aed",
      bot: "#9a3412",
      border: "linear-gradient(90deg, #7c3aed 0%, #ea580c 100%)",
      accent: "#fbbf24",
      card: "rgba(76, 29, 149, 0.42)",
    }),
  },
  {
    id: "nitro-cyberpunk",
    label: "Cyberpunk",
    previewBar: "#2563eb",
    previewTab: "#c026d3",
    appBackground:
      "linear-gradient(125deg, #1d4ed8 0%, #a21caf 42%, #6d28d9 100%)",
    paletteMode: "dark",
    patch: {
      dashboard: {
        headerBorderGradient: "linear-gradient(90deg, #2563eb 0%, #c026d3 50%, #7c3aed 100%)",
        sidebarBg: "#1e1b4b",
        headerBg: "#312e81",
        contentBg: "linear-gradient(180deg, #312e81 0%, #1e1b4b 100%)",
        cardBg: "rgba(49, 46, 129, 0.5)",
        cardBorder: "rgba(255, 255, 255, 0.1)",
        navItemSelectedBg: "rgba(168, 85, 247, 0.35)",
        navActiveBg: "rgba(192, 38, 211, 0.28)",
        accentBlue: "#a78bfa",
        menuSurfaceBg: "#312e81",
        pillBg: "#1e1b4b",
        pillActive: "#312e81",
        liveChat: {
          cardBg: "#312e81",
          messageBg: "#1e1b4b",
          avatarBg: "#c026d3",
          messageText: "rgba(248, 250, 252, 0.9)",
          cardGlass: "rgba(244, 244, 244, 0.02)",
        },
      },
    },
  },
  {
    id: "nitro-forest-bronze",
    label: "Forest bronze",
    previewBar: "#1a3d2e",
    previewTab: "#8b6914",
    ...darkShell({
      sidebar: "#14532d",
      header: "#166534",
      top: "#1a3d2e",
      bot: "#713f12",
      border: "linear-gradient(90deg, #15803d 0%, #a16207 100%)",
      accent: "#eab308",
      card: "rgba(20, 83, 45, 0.48)",
    }),
  },
  {
    id: "nitro-crimson-void",
    label: "Crimson void",
    previewBar: "#7f1d1d",
    previewTab: "#0a0a0a",
    ...darkShell({
      sidebar: "#450a0a",
      header: "#7f1d1d",
      top: "#991b1b",
      bot: "#0a0a0a",
      border: "linear-gradient(90deg, #dc2626 0%, #171717 100%)",
      accent: "#f87171",
      card: "rgba(69, 10, 10, 0.55)",
    }),
  },
  {
    id: "nitro-midnight-navy",
    label: "Midnight navy",
    previewBar: "#0f172a",
    previewTab: "#020617",
    ...darkShell({
      sidebar: "#0f172a",
      header: "#1e293b",
      top: "#1e3a8a",
      bot: "#020617",
      border: "linear-gradient(90deg, #1e40af 0%, #0f172a 100%)",
      accent: "#60a5fa",
      card: "rgba(15, 23, 42, 0.65)",
    }),
  },
  {
    id: "nitro-earth",
    label: "Earth",
    previewBar: "#5c4033",
    previewTab: "#3d2e28",
    ...darkShell({
      sidebar: "#44403c",
      header: "#57534e",
      top: "#5c4033",
      bot: "#292524",
      border: "linear-gradient(90deg, #78716c 0%, #57534e 100%)",
      accent: "#d6d3d1",
      card: "rgba(68, 64, 60, 0.55)",
    }),
  },
  {
    id: "nitro-steel-slate",
    label: "Steel slate",
    previewBar: "#4a6fa5",
    previewTab: "#1e293b",
    ...darkShell({
      sidebar: "#334155",
      header: "#475569",
      top: "#4a6fa5",
      bot: "#0f172a",
      border: "linear-gradient(90deg, #64748b 0%, #334155 100%)",
      accent: "#94a3b8",
      card: "rgba(51, 65, 85, 0.5)",
    }),
  },
  {
    id: "nitro-pine",
    label: "Pine",
    previewBar: "#14532d",
    previewTab: "#0f2419",
    ...darkShell({
      sidebar: "#14532d",
      header: "#166534",
      top: "#166534",
      bot: "#052e16",
      border: "linear-gradient(90deg, #22c55e 0%, #14532d 100%)",
      accent: "#86efac",
      card: "rgba(20, 83, 45, 0.5)",
    }),
  },
  {
    id: "nitro-deep-sea",
    label: "Deep sea",
    previewBar: "#0d9488",
    previewTab: "#1e3a8a",
    ...darkShell({
      sidebar: "#0f766e",
      header: "#115e59",
      top: "#0d9488",
      bot: "#1e3a8a",
      border: "linear-gradient(90deg, #14b8a6 0%, #1d4ed8 100%)",
      accent: "#5eead4",
      card: "rgba(15, 118, 110, 0.45)",
    }),
  },
  // Row 3 — jewel tones
  {
    id: "nitro-teal-violet",
    label: "Teal violet",
    previewBar: "#14b8a6",
    previewTab: "#6b21a8",
    ...darkShell({
      sidebar: "#0f766e",
      header: "#6d28d9",
      top: "#14b8a6",
      bot: "#581c87",
      border: "linear-gradient(90deg, #2dd4bf 0%, #a855f7 100%)",
      accent: "#c4b5fd",
      card: "rgba(88, 28, 135, 0.42)",
    }),
  },
  {
    id: "nitro-magenta-gold",
    label: "Magenta gold",
    previewBar: "#db2777",
    previewTab: "#eab308",
    ...darkShell({
      sidebar: "#9d174d",
      header: "#a16207",
      top: "#db2777",
      bot: "#a16207",
      border: "linear-gradient(90deg, #ec4899 0%, #eab308 100%)",
      accent: "#fde047",
      card: "rgba(157, 23, 77, 0.45)",
    }),
  },
  {
    id: "nitro-emerald-navy",
    label: "Emerald navy",
    previewBar: "#059669",
    previewTab: "#1e1b4b",
    ...darkShell({
      sidebar: "#065f46",
      header: "#1e1b4b",
      top: "#059669",
      bot: "#1e1b4b",
      border: "linear-gradient(90deg, #34d399 0%, #312e81 100%)",
      accent: "#6ee7b7",
      card: "rgba(6, 95, 70, 0.45)",
    }),
  },
  {
    id: "nitro-mocha",
    label: "Mocha",
    previewBar: "#5c4033",
    previewTab: "#1c1917",
    ...darkShell({
      sidebar: "#44403c",
      header: "#292524",
      top: "#5c4033",
      bot: "#1c1917",
      border: "linear-gradient(90deg, #78716c 0%, #292524 100%)",
      accent: "#d6d3d1",
      card: "rgba(41, 37, 36, 0.55)",
    }),
  },
  {
    id: "nitro-royal-indigo",
    label: "Royal indigo",
    previewBar: "#2563eb",
    previewTab: "#312e81",
    ...darkShell({
      sidebar: "#1e3a8a",
      header: "#312e81",
      top: "#2563eb",
      bot: "#1e1b4b",
      border: "linear-gradient(90deg, #3b82f6 0%, #4338ca 100%)",
      accent: "#93c5fd",
      card: "rgba(30, 58, 138, 0.48)",
    }),
  },
];
