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

export function WidgetAccentDensityPreview({
  accent,
  density,
  launcherColor,
  headerTextColor,
  embedded = false,
}: {
  accent: string;
  density: string;
  launcherColor: string;
  headerTextColor: string;
  /** Hide outer caption when nested inside launcher preview. */
  embedded?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const palette = resolveAccentPalette(accent);
  const densityTokens = resolveDensityTokens(density);
  const gap = densityTokens.stackGapMultiplier;

  return (
    <Box sx={embedded ? undefined : { mt: 1.5 }}>
      {!embedded ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
          Accent and density inside the chat panel.
        </Typography>
      ) : null}
      <Box
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          overflow: "hidden",
          width: "100%",
          bgcolor: "#fff",
          color: "#0f172a",
          fontSize: 13,
          boxShadow: embedded ? "0 8px 24px rgba(15, 23, 42, 0.08)" : undefined,
        }}
      >
        <Box
          sx={{
            px: 1.5,
            py: 1.1,
            bgcolor: launcherColor,
            color: headerTextColor,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Live chat
        </Box>
        <Box sx={{ p: `${densityTokens.panelPaddingPx}px` }}>
          <Stack spacing={gap}>
            <Stack direction="row" spacing={0.75 * gap} flexWrap="wrap">
              <Box
                sx={{
                  px: `${densityTokens.chipPx}px`,
                  py: `${densityTokens.chipPy}px`,
                  borderRadius: 99,
                  border: `1px solid ${palette.border}`,
                  bgcolor: "#fff",
                  color: "#0f172a",
                  fontSize: 12,
                  fontWeight: 600,
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
                  fontWeight: 600,
                }}
              >
                Technical
              </Box>
            </Stack>
            <Box
              sx={{
                border: `1px solid ${palette.border}`,
                borderRadius: 1.25,
                px: 1.25,
                py: `${densityTokens.inputPaddingPx}px`,
                bgcolor: palette.light,
                fontSize: 12,
                color: "#64748b",
              }}
            >
              Type a message…
            </Box>
            <Stack direction="row" spacing={0.75 * gap} alignItems="flex-end">
              <Box
                sx={{
                  flex: 1,
                  px: 1.25,
                  py: `${densityTokens.messagePy}px`,
                  borderRadius: 1.5,
                  bgcolor: palette.light,
                  color: "#0f172a",
                  fontSize: 12,
                  lineHeight: 1.45,
                }}
              >
                Hi! How can we help?
              </Box>
              <Box
                sx={{
                  px: 1.25,
                  py: `${densityTokens.messagePy}px`,
                  borderRadius: 1.5,
                  bgcolor: launcherColor,
                  color: "#fff",
                  fontSize: 12,
                  maxWidth: "46%",
                  lineHeight: 1.45,
                }}
              >
                Hello
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
