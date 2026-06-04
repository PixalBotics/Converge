"use client";

import Close from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import type { ChatWhisperSocketPayload } from "@/services/chat/supervisor.types";

function supervisorName(payload: ChatWhisperSocketPayload): string {
  const u = payload.whisper.fromUser;
  if (!u) return "Supervisor";
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return name || u.email || "Supervisor";
}

type Props = {
  payload: ChatWhisperSocketPayload;
  onInsert: (text: string) => void;
  onDismiss: () => void;
};

/** Compact whisper hint above the composer — not shown in the message thread. */
export function ChatWhisperComposerStrip({ payload, onInsert, onDismiss }: Props) {
  const theme = useTheme() as AppTheme;
  const violet = theme.app.dashboard.accentViolet;

  return (
    <Box
      sx={{
        mx: 2,
        mb: 0.75,
        px: 1.25,
        py: 1,
        borderRadius: 1.5,
        flexShrink: 0,
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        border: `1px solid ${alpha(violet, 0.4)}`,
        bgcolor: alpha(violet, 0.1),
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: violet, fontSize: 11 }}>
          Whisper from {supervisorName(payload)} · visitors cannot see this
        </Typography>
        <Typography variant="small" sx={{ display: "block", mt: 0.35, fontSize: 13, lineHeight: 1.45 }}>
          {payload.whisper.message}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
        <Button
          type="button"
          variant="primary"
          size="small"
          onClick={() => onInsert(payload.whisper.message)}
        >
          Insert
        </Button>
        <IconButton
          size="small"
          aria-label="Dismiss whisper"
          onClick={onDismiss}
          sx={{ color: theme.app.dashboard.textMuted }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
