"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useConversationSupervisor } from "@/features/chat-operations/hooks/useConversationSupervisor";
import {
  canUseSupervisorTools,
  canWhisper,
} from "@/lib/permissions/chat-access";
import {
  releaseDirectSupervisorControl,
  startDirectSupervisorControl,
} from "@/services/chat/supervisor.api";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";

interface MonitorSupervisorSidePanelProps {
  conversationId: string | null;
  assignedAgentId: string | null | undefined;
  supervisorControlUserId: string | null | undefined;
  currentUserId: string | null | undefined;
  hasOperational: (p: string) => boolean;
  readOnly?: boolean;
  onActionComplete?: (payload?: unknown) => void;
}

/** Compact takeover + whisper controls for the monitor visitor column. */
export function MonitorSupervisorSidePanel({
  conversationId,
  assignedAgentId,
  supervisorControlUserId,
  currentUserId,
  hasOperational,
  readOnly = false,
  onActionComplete,
}: MonitorSupervisorSidePanelProps) {
  const theme = useTheme() as AppTheme;
  const enabled =
    !readOnly && canUseSupervisorTools(hasOperational) && Boolean(conversationId);
  const supervisor = useConversationSupervisor(conversationId, enabled);
  const [whisperText, setWhisperText] = useState("");
  const [busy, setBusy] = useState(false);

  if (!conversationId || !enabled) return null;

  const isControlling =
    Boolean(supervisorControlUserId) &&
    Boolean(currentUserId) &&
    supervisorControlUserId === currentUserId;

  const showWhisper =
    canWhisper(hasOperational) &&
    Boolean(assignedAgentId) &&
    assignedAgentId !== currentUserId &&
    !isControlling;

  const run = async (fn: () => Promise<void>, successMsg?: string) => {
    setBusy(true);
    try {
      await fn();
      if (successMsg) {
        publishAppToast({ variant: "success", message: successMsg });
      }
      onActionComplete?.();
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Request failed.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        px: 2,
        pb: 1.5,
        pt: 0.5,
        borderTop: `1px solid ${theme.app.dashboard.cardBorder}`,
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: theme.app.text.primary,
          mb: 0.75,
        }}
      >
        Supervisor
      </Typography>

      {!isControlling ? (
        <Button
          type="button"
          variant="primary"
          size="small"
          fullWidth
          sx={{ ...gradientPrimaryButtonSx, mb: showWhisper ? 1 : 0 }}
          disabled={busy}
          onClick={() =>
            void run(async () => {
              const ctrl = await startDirectSupervisorControl(conversationId);
              onActionComplete?.({
                conversationId,
                supervisorControlUserId: ctrl.supervisorControlUserId,
              });
            }, "You are controlling this chat.")
          }
        >
          Take over chat
        </Button>
      ) : (
        <Button
          type="button"
          variant="outlined"
          size="small"
          fullWidth
          disabled={busy}
          onClick={() =>
            void run(async () => {
              await releaseDirectSupervisorControl(conversationId);
              onActionComplete?.({
                conversationId,
                supervisorControlUserId: null,
              });
            }, "Chat returned to the agent.")
          }
        >
          Release control
        </Button>
      )}

      {showWhisper ? (
        <Box sx={{ mt: 1 }}>
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
            sx={{ mt: 0.75 }}
            disabled={busy || !whisperText.trim()}
            onClick={() =>
              void run(async () => {
                await supervisor.sendWhisper(whisperText.trim());
                setWhisperText("");
              }, "Whisper sent (agent only).")
            }
          >
            Send whisper
          </Button>
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 0.5, fontSize: 10, color: theme.app.dashboard.textMuted }}
          >
            Not visible to the visitor.
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
