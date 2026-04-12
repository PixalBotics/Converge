import { createTheme, darken } from "@mui/material/styles";

/** App-wide background gradient (Discord-style midnight + Nitro-adjacent presets). */
export const mainBackgroundGradient =
  "linear-gradient(180deg, #050508 0%, #0a0a2c 100%)";

/** Design tokens: app palette. Single source of truth; access via theme.app. */
const appColors = {
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(203, 213, 225, 0.8)",
    link: "rgba(203, 213, 225, 0.9)",
    or: "rgba(148, 163, 184, 0.8)",
    placeholder: "#CFC6C6",
    iconMuted: "rgba(255, 255, 255, 0.7)",
  },
  border: {
    divider: "rgba(148, 163, 184, 0.3)",
    input: "rgba(255, 255, 255, 0.23)",
    inputFocus: "rgba(255, 255, 255, 0.4)",
  },
  shadow: {
    inputFocus: "rgba(255, 255, 255, 0.2)",
    buttonHoverBg: "rgba(255, 255, 255, 0.04)",
  },
  grey: {
    checkboxBorder: "#CCCCCC",
    inputShadowLight: "#F2F2F2",
    inputShadowWhite: "#FFFFFF",
    inputShadowWhite80: "rgba(255, 255, 255, 0.5)",
    inputShadowDark: "#262626",
    inputShadowDarker: "#333333",
    socialButtonDark: "#333331",
  },
  dashboard: {
    /** Bottom border under dashboard header / sidebar header */
    headerBorderGradient: "linear-gradient(90deg, #202225 0%, #5865f2 100%)",
    /** 1px outline on floating sidebar / header panels (glass UI) */
    shellBorder: "rgba(255, 255, 255, 0.1)",
    /** Large corner radius for sidebar + header shells */
    shellRadius: "28px",
    /** Selected nav row background */
    navItemSelectedBg: "rgba(88, 101, 242, 0.22)",
    /** Inset glass shadow on selected nav (matches grey.* chip colors) */
    navSelectedInsetShadow: `
      0px 0px 6px 0px #F2F2F2 inset,
      0px 0px 3px 0px #FFFFFF80 inset,
      -1px -1px 0.5px -1px #FFFFFF inset,
      1px 1px 0.5px -1px #FFFFFF inset,
      -1px -1px 0px -0.5px #262626 inset,
      1px 1px 0px -0.5px #333333 inset
    `,
    /** Search field + icon button outline on dark chrome */
    searchChromeBorder: "#181818",
    /** Secondary line (e.g. “Dashboard” label) */
    textSubtleMuted: "rgba(255, 255, 255, 0.5)",
    /** Account / overflow menus */
    menuSurfaceBg: "#1e1f22",
    mobileSearchBarBg: "rgba(43, 45, 49, 0.96)",
    mobileSearchBackdrop: "rgba(0, 0, 0, 0.4)",
    white80: "rgba(255, 255, 255, 0.8)",
    white90: "rgba(255, 255, 255, 0.9)",
    mobileSearchBarShadow:
      "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)",
    sidebarBg: "#2b2d31",
    headerBg: "#1e1f22",
    contentBg: "linear-gradient(180deg, #1e1f22 0%, #2b2d31 100%)",
    cardBg: "rgba(47, 49, 54, 0.88)",
    /** DashboardCard frosted layer */
    cardBackdropBlur: "blur(116.45703125px)",
    /** `none` = full painted sidebar (uses page background). Else translucent + blur. */
    sidebarBackdropBlur: "none",
    headerBackdropBlur: "none",
    /** Main column frosted overlay; `none` = transparent (page bg shows through). */
    mainBackdropBlur: "none",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    navActiveBg: "rgba(88, 101, 242, 0.24)",
    accentBlue: "#5865F2",
    accentOrange: "#F97316",
    accentPink: "#EC4899",
    accentPurple: "#A855F7",
    accentGreen: "#22C55E",
    accentRed: "#EF4444",
    accentCyan: "#67E8F9",
    accentViolet: "#A78BFA",
    accentIndigo: "#6366F1",
    accentYellow: "#EAB308",
    accentRedLight: "#FCA5A5",
    accentGreenLight: "#4ADE80",
    accentPinkLight: "#F9A8D4",
    blueTint: "#93C5FD",
    blueTintBg: "rgba(59, 130, 246, 0.16)",
    pinkTintBg: "rgba(244, 114, 182, 0.16)",
    successTintBg: "rgba(22, 163, 74, 0.12)",
    errorTintBg: "rgba(239, 68, 68, 0.12)",
    buttonIndigo: "#4F46E5",
    tableDivider: "#838080",
    iconMuted: "#E5E7EB",
    textMuted: "rgba(148, 163, 184, 0.9)",
    textMuted95: "rgba(148, 163, 184, 0.95)",
    overlayLight: "rgba(255, 255, 255, 0.06)",
    overlayMedium: "rgba(255, 255, 255, 0.08)",
    overlayBorder: "rgba(255, 255, 255, 0.2)",
    modalOverlay: "rgba(33, 33, 33, 0.8)",
    backdropDark: "rgba(0, 0, 0, 0.55)",
    white60: "rgba(255, 255, 255, 0.6)",
    white65: "rgba(255, 255, 255, 0.65)",
    white7: "rgba(255, 255, 255, 0.7)",
    white95: "rgba(255, 255, 255, 0.95)",
    surfaceDark: "rgba(15, 23, 42, 0.9)",
    closeIconDanger: "#C22E2E",
    radioActiveBorder: "rgba(34, 197, 94, 0.6)",
    radioInactiveBorder: "rgba(148, 163, 184, 0.6)",
    radioActiveRing: "rgba(34, 197, 94, 0.35)",
    glassGradient: "linear-gradient(140deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))",
    glassShadow:
      "0 8px 18px rgba(2, 8, 30, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    liveChat: {
      cardBg: "#2b2d31",
      messageBg: "#313338",
      avatarBg: "#5865F2",
      messageText: "#D0D0D0",
      cardGlass: "#F4F4F403",
    },
    chartPurple: "#3A3258",
    chartViolet: "#6B46C1",
    pillBg: "#2b2d31",
    pillActive: "#1e1f22",
    primaryTint: "#0048B70A",
    gradientButton: "linear-gradient(135deg, #1F2937 0%, #020617 100%)",
    /** Label/icon on `gradientButton` (not `text.primary`, which is for page body in light themes). */
    gradientButtonText: "rgba(248, 250, 252, 0.98)",
    gradientIcon: "radial-gradient(100% 100% at 50% 0%, #A855F7 0%, #312E81 100%)",
  },
} as const;

/** Exported for appearance presets / dynamic theme merge. */
export const defaultAppColors = appColors;

declare module "@mui/material/styles" {
  interface Theme {
    appBackground: string;
    app: typeof appColors;
  }
  interface ThemeOptions {
    appBackground?: string;
    app?: typeof appColors;
  }
}

/** Static default; runtime theme may be overridden by `ThemeRegistry`. */
export const theme = createAppMuiTheme(appColors, mainBackgroundGradient, "dark");

/** Theme type including app palette. Use for useTheme() and SxProps<AppTheme>. */
export type AppTheme = typeof theme;

/** Pill CTA (Add Department / Role / User, etc.): tints from accent so it matches preset & custom color. */
function accentCtaGradient(accent: string) {
  return `linear-gradient(135deg, ${darken(accent, 0.32)} 0%, ${darken(accent, 0.58)} 100%)`;
}

export function createAppMuiTheme(
  app: typeof appColors,
  appBackground: string,
  paletteMode: "light" | "dark"
) {
  const accent = app.dashboard.accentBlue;
  const appResolved = {
    ...app,
    dashboard: {
      ...app.dashboard,
      gradientButton: accentCtaGradient(accent),
    },
  } as typeof appColors;

  return createTheme({
    typography: {
      fontFamily: '"Inter", "Manrope", sans-serif',
    },
    palette: {
      mode: paletteMode,
      primary: {
        main: accent,
        dark: darken(accent, 0.15),
      },
      secondary: {
        main: "#9c27b0",
      },
    },
    appBackground,
    app: appResolved,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          },
          body: {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          },
        },
      },
    },
  });
}

