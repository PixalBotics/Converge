"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseRounded from "@mui/icons-material/CloseRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { AiTrainingBehaviorPanel } from "./AiTrainingBehaviorPanel";
import {
  aiTrainingSettingsDrawerBody,
  aiTrainingSettingsDrawerHeader,
} from "./ai-training-studio.styles";
import { studioColors } from "./ai-training-studio.tokens";

export function AiTrainingStudioSettingsRail({
  websiteId,
  onClose,
}: {
  websiteId: string;
  onClose?: () => void;
}) {
  const theme = useTheme() as AppTheme;
  const c = studioColors(theme);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box sx={aiTrainingSettingsDrawerHeader}>
        <Box sx={{ display: "flex", gap: 1.25, minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(c.accent, 0.12),
              color: c.accent,
            }}
          >
            <SettingsRounded sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body1" fontWeight={700} sx={{ color: c.text }}>
              Bot settings
            </Typography>
            <Typography variant="caption" sx={{ color: c.textSecondary, lineHeight: 1.5, display: "block" }}>
              Control how strict the bot is and what it says when it is unsure, cannot find an answer, or
              needs a human agent.
            </Typography>
          </Box>
        </Box>
        {onClose ? (
          <IconButton
            size="small"
            aria-label="Close settings"
            onClick={onClose}
            sx={{ color: c.textSecondary, mt: 0.25 }}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        ) : null}
      </Box>

      <Box sx={aiTrainingSettingsDrawerBody}>
        <AiTrainingBehaviorPanel websiteId={websiteId} variant="studio" />
      </Box>
    </Box>
  );
}
