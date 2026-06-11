"use client";

import CloseRounded from "@mui/icons-material/CloseRounded";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { FLOW_BUILDER_EXPERIMENTAL_UI } from "./ai-training-studio.flags";
import { FLOW_BUILDER_GUIDE, FLOW_BUILDER_GUIDE_READONLY, studioColors } from "./ai-training-studio.tokens";

export function AiTrainingStudioGuideBar() {
  const theme = useTheme() as AppTheme;
  const c = studioColors(theme);
  const [open, setOpen] = useState(false);
  const guide = FLOW_BUILDER_EXPERIMENTAL_UI ? FLOW_BUILDER_GUIDE : FLOW_BUILDER_GUIDE_READONLY;

  if (!open) {
    return (
      <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 12 }}>
        <Box
          component="button"
          type="button"
          onClick={() => setOpen(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            border: `1px solid ${c.border}`,
            borderRadius: 2,
            px: 1.25,
            py: 0.6,
            cursor: "pointer",
            bgcolor: c.surface,
            color: c.text,
            fontSize: 12,
            fontWeight: 600,
            boxShadow: `0 4px 14px ${alpha(theme.palette.common.black, 0.06)}`,
          }}
        >
          <LightbulbOutlined sx={{ fontSize: 16, color: c.accent }} />
          How this works
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        zIndex: 12,
        maxWidth: 720,
        borderRadius: 2,
        border: `1px solid ${alpha(c.accent, 0.35)}`,
        bgcolor: c.surface,
        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          bgcolor: alpha(c.accent, 0.08),
          borderBottom: `1px solid ${alpha(c.border, 0.6)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LightbulbOutlined sx={{ fontSize: 18, color: c.accent }} />
          <Typography variant="body2" fontWeight={700} sx={{ color: c.text }}>
            {guide.title}
          </Typography>
        </Box>
        <IconButton size="small" aria-label="Dismiss guide" onClick={() => setOpen(false)} sx={{ color: c.textSecondary }}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ px: 1.5, py: 1.25, display: "grid", gap: 0.85 }}>
        {guide.steps.map((step) => (
          <Typography key={step.label} variant="caption" sx={{ color: c.textSecondary, lineHeight: 1.5, display: "block" }}>
            <Box component="span" sx={{ color: c.text, fontWeight: 700 }}>
              {step.label}
            </Box>{" "}
            — {step.text}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
