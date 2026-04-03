import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { parseHexToRgb } from "@/lib/theme/shellChrome";
import { deriveReadableTextHexesFromBackground } from "@/lib/theme/backgroundTextContrast";
import { deriveDashboardUiTokens } from "@/lib/theme/dashboardUiTokens";
import type { DashboardContentUi } from "@/lib/dashboard-appearance/types";

function buildAppColorsWithText(primaryHex: string, secondaryHex: string) {
  const p = parseHexToRgb(primaryHex);
  const s = parseHexToRgb(secondaryHex);
  return {
    ...appColors,
    text: {
      ...appColors.text,
      primary: primaryHex,
      secondary: `rgba(${s.r},${s.g},${s.b},0.9)`,
      link: `rgba(${s.r},${s.g},${s.b},0.95)`,
      or: `rgba(${s.r},${s.g},${s.b},0.78)`,
      placeholder: `rgba(${s.r},${s.g},${s.b},0.68)`,
      iconMuted: `rgba(${p.r},${p.g},${p.b},0.72)`,
    },
    dashboard: {
      ...appColors.dashboard,
      /** Keep neutral: body `text.primary` gets a cool tint from auto-contrast; chart + metric values stay #fff. */
      textMuted: `rgba(${s.r},${s.g},${s.b},0.92)`,
      textMuted95: `rgba(${s.r},${s.g},${s.b},0.96)`,
      iconMuted: `rgba(${p.r},${p.g},${p.b},0.88)`,
    },
  };
}

/**
 * Default canvas: layered meshes + deep base — reads as modern AI / SaaS without busy noise.
 * Safe to replace via Settings (stored CSS `background` value: color or gradients).
 */
export const mainBackgroundGradient =
  "radial-gradient(ellipse 118% 88% at 82% -18%, rgba(99, 102, 241, 0.42) 0%, transparent 54%), radial-gradient(ellipse 92% 72% at 6% 102%, rgba(168, 85, 247, 0.2) 0%, transparent 50%), radial-gradient(ellipse 76% 58% at 48% 108%, rgba(34, 211, 238, 0.12) 0%, transparent 46%), linear-gradient(172deg, #06060e 0%, #0b0916 40%, #070712 100%)";

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
    navActiveBg: "rgba(99, 102, 241, 0.22)",
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
    glassGradient: "linear-gradient(145deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.02) 100%)",
    glassShadow:
      "0 12px 40px rgba(2, 6, 23, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06) inset, inset 0 1px 0 rgba(255, 255, 255, 0.12)",
    /** Shell: sidebar / header frosted layer */
    glassChromeBg:
      "linear-gradient(180deg, rgba(15, 23, 42, 0.52) 0%, rgba(15, 23, 42, 0.36) 100%)",
    glassChromeBlur: "blur(22px) saturate(160%)",
    glassChromeBorder: "rgba(255, 255, 255, 0.1)",
    glassChromeHighlight: "rgba(255, 255, 255, 0.14)",
    navLabel: "rgba(165, 180, 252, 0.92)",
    navItemHover: "rgba(255, 255, 255, 0.06)",
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
    /** Filled from `deriveDashboardUiTokens` when theme is built from appearance */
    chartGridStroke: "#FFFFFF",
    chartAxisStroke: "rgba(255,255,255,0.25)",
    chartTickFill: "rgba(255,255,255,0.7)",
    chartCursor: "rgba(255,255,255,0.45)",
    chartLinePrimary: "#FFFFFF",
    chartLineSecondary: "#0048B7",
    chartAreaStopTop: "rgba(255,255,255,0.18)",
    chartAreaStopMid: "rgba(168, 85, 247, 0.08)",
    chartAreaStopBottom: "rgba(168, 85, 247, 0)",
    chartTooltipBg: "rgba(15, 23, 42, 0.92)",
    chartTooltipBorder: "rgba(148, 163, 184, 0.25)",
    chartTooltipLabel: "#FFFFFF",
    metricValueDefault: "#818CF8",
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

const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Manrope", sans-serif',
  },
  palette: {
    mode: "light",
    primary: {
      main: "#6366F1",
      dark: "#4F46E5",
    },
    secondary: {
      main: "#A855F7",
    },
  },
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
};

export type AppThemeTextOptions =
  | { autoFromBackground: true }
  | { primaryHex: string; secondaryHex: string; autoFromBackground?: false };

export function createAppTheme(
  appBackground: string = mainBackgroundGradient,
  text?: AppThemeTextOptions,
  contentUi?: DashboardContentUi
) {
  let primaryHex = text && "primaryHex" in text ? text.primaryHex : undefined;
  let secondaryHex = text && "secondaryHex" in text ? text.secondaryHex : undefined;
  if (text?.autoFromBackground) {
    const d = deriveReadableTextHexesFromBackground(appBackground);
    primaryHex = d.primaryHex;
    secondaryHex = d.secondaryHex;
  }

  let app: typeof appColors;
  if (primaryHex != null && secondaryHex != null) {
    const built = buildAppColorsWithText(primaryHex, secondaryHex);
    const ui = deriveDashboardUiTokens(appBackground, primaryHex, secondaryHex, contentUi);
    app = {
      ...built,
      dashboard: {
        ...built.dashboard,
        cardBg: ui.cardBg,
        cardBorder: ui.cardBorder,
        chartGridStroke: ui.chartGrid,
        chartAxisStroke: ui.chartAxis,
        chartTickFill: ui.chartTick,
        chartCursor: ui.chartCursor,
        chartLinePrimary: ui.chartLine1,
        chartLineSecondary: ui.chartLine2,
        chartAreaStopTop: ui.chartAreaStopTop,
        chartAreaStopMid: ui.chartAreaStopMid,
        chartAreaStopBottom: ui.chartAreaStopBottom,
        chartTooltipBg: ui.chartTooltipBg,
        chartTooltipBorder: ui.chartTooltipBorder,
        chartTooltipLabel: ui.chartTooltipLabel,
        metricValueDefault: ui.metricValue,
      },
    } as typeof appColors;
  } else {
    app = appColors;
  }

  return createTheme({
    ...baseThemeOptions,
    appBackground,
    app: app as unknown as typeof appColors,
    palette: {
      ...baseThemeOptions.palette,
      ...(primaryHex != null && secondaryHex != null
        ? {
            text: {
              primary: primaryHex,
              secondary: app.text.secondary,
            },
          }
        : {}),
    },
    components: {
      ...baseThemeOptions.components,
      MuiTypography: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.app.text.iconMuted,
          }),
        },
      },
    },
  });
}

/** Static default theme (SSR and tests). Prefer ThemeRegistry for interactive app. */
export const theme = createAppTheme();

/** Theme type including app palette. Use for useTheme() and SxProps<AppTheme>. */
export type AppTheme = ReturnType<typeof createAppTheme>;
