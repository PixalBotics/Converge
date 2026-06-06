"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { AiPipelineStep } from "@/api/ai-training/ai-training.api";

function stepDotColor(
  theme: AppTheme,
  status: AiPipelineStep["status"],
): string {
  switch (status) {
    case "done":
      return theme.palette.success.light;
    case "failed":
      return theme.palette.error.light;
    case "warn":
      return theme.palette.warning.light;
    case "skipped":
    default:
      return theme.palette.info.light;
  }
}

export function AiTrainingPipelineTrace({ steps }: { steps: AiPipelineStep[] }) {
  const theme = useTheme() as AppTheme;

  if (steps.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
        Send a test message to see the AI pipeline.
      </Typography>
    );
  }

  return (
    <Stack spacing={0} sx={{ position: "relative", pl: 1.5 }}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <Box
            key={`${step.id}-${index}`}
            sx={{
              display: "flex",
              gap: 1.25,
              pb: isLast ? 0 : 1.5,
              position: "relative",
            }}
          >
            {!isLast ? (
              <Box
                sx={{
                  position: "absolute",
                  left: 5,
                  top: 14,
                  bottom: 0,
                  width: 2,
                  bgcolor: theme.app.dashboard.cardBorder,
                }}
              />
            ) : null}
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                flexShrink: 0,
                mt: 0.35,
                bgcolor: stepDotColor(theme, step.status),
                border: `2px solid ${theme.app.dashboard.cardBorder}`,
                zIndex: 1,
              }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.white95 }}>
                {step.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.app.dashboard.textMuted,
                  display: "block",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {step.detail}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
