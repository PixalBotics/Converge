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

