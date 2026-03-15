import { createTheme } from "@mui/material/styles";

/** App-wide background gradient. Used in theme and any non-MUI usage. */
export const mainBackgroundGradient =
  "radial-gradient(50% 50% at 50% 50%, #09013F 0%, #00011A 100%)";

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
    sidebarBg: "#0F0E24",
    headerBg: "#16142A",
    contentBg: "linear-gradient(180deg, #100E26 0%, #0D0B1E 100%)",
    cardBg: "rgba(22, 20, 42, 0.8)",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    navActiveBg: "rgba(59, 130, 246, 0.2)",
    accentBlue: "#3B82F6",
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
    white60: "rgba(255, 255, 255, 0.6)",
    white65: "rgba(255, 255, 255, 0.65)",
    white7: "rgba(255, 255, 255, 0.7)",
    white95: "rgba(255, 255, 255, 0.95)",
    liveChat: {
      cardBg: "#1B1938",
      messageBg: "#282548",
      avatarBg: "#5B4F8B",
      messageText: "#D0D0D0",
      cardGlass: "#F4F4F403",
    },
    chartPurple: "#3A3258",
    chartViolet: "#6B46C1",
    pillBg: "#16123F",
    pillActive: "#2B254D",
    primaryTint: "#0048B70A",
    gradientButton: "linear-gradient(135deg, #1F2937 0%, #020617 100%)",
    gradientIcon: "radial-gradient(100% 100% at 50% 0%, #A855F7 0%, #312E81 100%)",
  },
} as const;

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

export const theme = createTheme({
  typography: {
    fontFamily: '"Manrope", sans-serif',
  },
  palette: {
    mode: "light",
    primary: {
      main: "#0048B7",
      dark: "#003d99",
    },
    secondary: {
      main: "#9c27b0",
    },
  },
  appBackground: mainBackgroundGradient,
  app: appColors,
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

/** Theme type including app palette. Use for useTheme() and SxProps<AppTheme>. */
export type AppTheme = typeof theme;

