import Box from "@mui/material/Box";
import { ThemeProvider } from "@mui/material/styles";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/common/Button/Button";
import { mergeAppColors } from "@/lib/theme/merge-app-colors";
import {
  createAppMuiTheme,
  defaultAppColors,
  mainBackgroundGradient,
  theme as defaultDashboardTheme,
} from "@/theme/theme";

const meta = {
  title: "Design System/Theme",
} satisfies Meta;

export default meta;

/** Simulates shifting `accentBlue` (same path as presets + account color merge). */
const emeraldAccent = createAppMuiTheme(
  mergeAppColors(defaultAppColors, {
    dashboard: { accentBlue: "#34d399" },
  }),
  mainBackgroundGradient,
  "dark",
);

export const PrimaryAccentShift: StoryObj = {
  render: () => (
    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "stretch" }}>
      <ThemeProvider theme={defaultDashboardTheme}>
        <Box
          sx={{
            flex: "1 1 240px",
            p: 3,
            borderRadius: "12px",
            border: `1px solid ${defaultDashboardTheme.app.dashboard.cardBorder}`,
            bgcolor: defaultDashboardTheme.app.dashboard.pillBg,
          }}
        >
          <Button type="button" variant="primary">
            Default accent
          </Button>
        </Box>
      </ThemeProvider>
      <ThemeProvider theme={emeraldAccent}>
        <Box
          sx={{
            flex: "1 1 240px",
            p: 3,
            borderRadius: "12px",
            border: `1px solid ${emeraldAccent.app.dashboard.cardBorder}`,
            bgcolor: emeraldAccent.app.dashboard.pillBg,
          }}
        >
          <Button type="button" variant="primary">
            Shifted accent
          </Button>
        </Box>
      </ThemeProvider>
    </Box>
  ),
};
