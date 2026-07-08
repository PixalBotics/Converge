"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";

const STEPS = [
  {
    n: "1",
    title: "Agency contract clients",
    text: "One combined invoice per client per month — all websites on one bill. Set invoice email on Agency contracts.",
  },
  {
    n: "2",
    title: "No agency contract?",
    text: "Bill each website separately from Per-website invoice — pick one site, set rates, and send.",
  },
  {
    n: "3",
    title: "Rates apply everywhere",
    text: "Agency-wide chat, support, and software rates sync to websites. Override per site if needed.",
  },
];

export function ContractsHowItWorks() {
  const theme = useTheme() as AppTheme;
  const app = theme.app;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        gap: 1.5,
        mb: 2,
      }}
    >
      {STEPS.map((step) => (
        <Box
          key={step.n}
          sx={{
            p: 1.5,
            borderRadius: "12px",
            border: `1px solid ${app.dashboard.cardBorder}`,
            bgcolor: alpha(app.dashboard.accentBlue, theme.palette.mode === "light" ? 0.05 : 0.1),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                bgcolor: app.dashboard.navActiveBg,
                color: app.text.primary,
                fontWeight: 800,
                fontSize: 13,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              {step.n}
            </Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: app.text.primary }}>
              {step.title}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: app.dashboard.textMuted, lineHeight: 1.55 }}>
            {step.text}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
