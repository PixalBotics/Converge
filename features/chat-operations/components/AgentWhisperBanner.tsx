"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import type { ChatWhisperSocketPayload } from "@/services/chat/supervisor.types";

interface AgentWhisperBannerProps {
  payload: ChatWhisperSocketPayload;
  onApplyToComposer: (text: string) => void;
  onDismiss: () => void;
  /** Inside ChatContextRail — no outer chrome. */
  embedded?: boolean;
}

function supervisorName(payload: ChatWhisperSocketPayload): string {
  const u = payload.whisper.fromUser;
  if (!u) return "Supervisor";
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return name || u.email || "Supervisor";
}

export function AgentWhisperBanner({
  payload,
  onApplyToComposer,
  onDismiss,
  embedded = false,
}: AgentWhisperBannerProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box
      sx={{
        ...(embedded
          ? { p: 1.25 }
          : {
              mx: 2,
              mt: 1,
              mb: 0.5,
              p: 1.5,
              borderRadius: 2,
              flexShrink: 0,
              border: `1px solid ${alpha(theme.app.dashboard.accentViolet, 0.45)}`,
              bgcolor: alpha(theme.app.dashboard.accentViolet, 0.12),
            }),
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, color: theme.app.dashboard.accentViolet }}>
        Supervisor whisper · {supervisorName(payload)}
      </Typography>
      <Typography variant="small" sx={{ display: "block", mt: 0.5, fontSize: 13, lineHeight: 1.45 }}>
        {payload.whisper.message}
      </Typography>
      <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: theme.app.dashboard.textMuted }}>
        {payload.agentMustClickSend
          ? "Visitors cannot see this. Add to your reply, then send when ready."
          : "Visitors cannot see this message."}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Button
          type="button"
          variant="primary"
          size="small"
          onClick={() => onApplyToComposer(payload.whisper.message)}
        >
          {payload.agentMustClickSend ? "Add to reply" : "Copy to composer"}
        </Button>
        <Button type="button" variant="secondary" size="small" onClick={onDismiss}>
          Dismiss
        </Button>
      </Box>
    </Box>
  );
}
