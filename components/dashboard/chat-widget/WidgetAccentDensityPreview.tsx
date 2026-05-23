"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  resolveAccentPalette,
  resolveDensityTokens,
} from "@/lib/chat-widget/design-accent-density";

/**
 * Step 1 live preview slice for `theme.designJson.accent` + `density`
 * (launcher FAB is previewed separately on the same page).
 */
export function WidgetAccentDensityPreview({
  accent,
  density,
  launcherColor,
  headerTextColor,
}: {
  accent: string;
  density: string;
  launcherColor: string;
  headerTextColor: string;
}) {
  const theme = useTheme() as AppTheme;
  const palette = resolveAccentPalette(accent);
  const densityTokens = resolveDensityTokens(density);
  const gap = densityTokens.stackGapMultiplier;

  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
        Accent & density preview — how chips and spacing look inside the chat panel (saved as{" "}
        <code>designJson.accent</code> / <code>designJson.density</code>).
      </Typography>
      <Box
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          overflow: "hidden",
          maxWidth: 280,
          bgcolor: "#fff",
          color: headerTextColor,
          fontSize: 13,
        }}
      >
        <Box
          sx={{
            px: 1.5,
            py: 1,
            bgcolor: launcherColor,
            color: headerTextColor,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Panel header
        </Box>
        <Box sx={{ p: `${densityTokens.panelPaddingPx}px` }}>
          <Stack spacing={gap}>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Inquiry pills (accent)
            </Typography>
            <Stack direction="row" spacing={0.75 * gap} flexWrap="wrap">
              <Box
                sx={{
                  px: `${densityTokens.chipPx}px`,
                  py: `${densityTokens.chipPy}px`,
                  borderRadius: 99,
                  border: `1px solid ${palette.border}`,
                  bgcolor: "#fff",
                  color: headerTextColor,
                  fontSize: 12,
                }}
              >
                Billing
              </Box>
              <Box
                sx={{
                  px: `${densityTokens.chipPx}px`,
                  py: `${densityTokens.chipPy}px`,
                  borderRadius: 99,
                  bgcolor: palette.main,
                  color: "#fff",
                  fontSize: 12,
                }}
              >
                Technical
              </Box>
            </Stack>
            <Box
              sx={{
                border: `1px solid ${palette.border}`,
                borderRadius: 1,
                px: 1,
                py: `${densityTokens.inputPaddingPx}px`,
                bgcolor: palette.light,
                fontSize: 12,
              }}
            >
              Sample input (accent border)
            </Box>
            <Stack direction="row" spacing={0.75 * gap}>
              <Box
                sx={{
                  flex: 1,
                  px: 1,
                  py: `${densityTokens.messagePy}px`,
                  borderRadius: 1.5,
                  bgcolor: palette.light,
                  color: headerTextColor,
                  fontSize: 12,
                }}
              >
                Incoming message
              </Box>
              <Box
                sx={{
                  px: 1,
                  py: `${densityTokens.messagePy}px`,
                  borderRadius: 1.5,
                  bgcolor: launcherColor,
                  color: "#fff",
                  fontSize: 12,
                  maxWidth: "48%",
                }}
              >
                You
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Box>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: 0.75, display: "block" }}>
        {palette.label} accent · {densityTokens.label} density
      </Typography>
    </Box>
  );
}
