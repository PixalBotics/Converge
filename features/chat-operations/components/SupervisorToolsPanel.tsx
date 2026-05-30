"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { canWhisper } from "@/lib/permissions/chat-access";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import type { useConversationSupervisor } from "../hooks/useConversationSupervisor";
import { ChatSideToolCard } from "@/features/chat-shared";

interface SupervisorToolsPanelProps {
  conversationId: string | null;
  assignedAgentId: string | null;
  currentUserId?: string;
  hasOperational: (p: string) => boolean;
  supervisor: ReturnType<typeof useConversationSupervisor>;
}

export function SupervisorToolsPanel({
  conversationId,
  assignedAgentId,
  currentUserId,
  hasOperational,
  supervisor,
}: SupervisorToolsPanelProps) {
  const theme = useTheme() as AppTheme;
  const [whisperText, setWhisperText] = useState("");
  const [busy, setBusy] = useState(false);

  const showWhisper = canWhisper(hasOperational);

  if (!conversationId || !showWhisper || !assignedAgentId || assignedAgentId === currentUserId) {
    return null;
  }

  return (
    <ChatSideToolCard
      accent="supervisor"
      title="Supervisor tools"
      subtitle="Whispers are only visible to the assigned agent, not the visitor."
    >
      <Box>
        <InputField
          label="Whisper to agent"
          value={whisperText}
          onChange={(e) => setWhisperText(e.target.value)}
          disabled={busy}
        />
        <Button
          type="button"
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mt: 1 }}
          disabled={busy || !whisperText.trim()}
          onClick={() => {
            void (async () => {
              setBusy(true);
              try {
                await supervisor.sendWhisper(whisperText.trim());
                setWhisperText("");
                publishAppToast({
                  variant: "success",
                  message: "Whisper sent to the assigned agent.",
                });
              } catch (err) {
                publishAppToast({
                  variant: "error",
                  message: extractApiErrorMessageForToast(err) ?? "Could not send whisper.",
                });
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          Send whisper
        </Button>
        <Typography
          variant="caption"
          sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.75 }}
        >
          Takeover requests are not used — assign chats from the queue instead.
        </Typography>
      </Box>
    </ChatSideToolCard>
  );
}
