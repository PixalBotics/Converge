"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { ChatSideToolCard } from "@/features/chat-shared";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useConversationSupervisor } from "@/features/chat-operations/hooks/useConversationSupervisor";
import { canUseSupervisorTools } from "@/lib/permissions/chat-access";
import {
  releaseDirectSupervisorControl,
  sendSupervisorControlMessage,
  startDirectSupervisorControl,
  supervisorCloseConversation,
} from "@/services/chat/supervisor.api";
import { canSupervisorCloseChat } from "@/lib/permissions/chat-access";

interface MonitorActionsPanelProps {
  conversationId: string | null;
  supervisorControlUserId: string | null | undefined;
  currentUserId: string | null | undefined;
  hasOperational: (p: string) => boolean;
  readOnly?: boolean;
  onActionComplete?: () => void;
  onMessageSent?: () => void;
}

export function MonitorActionsPanel({
  conversationId,
  supervisorControlUserId,
  currentUserId,
  hasOperational,
  readOnly = false,
  onActionComplete,
  onMessageSent,
}: MonitorActionsPanelProps) {
  const theme = useTheme() as AppTheme;
  const enabled =
    !readOnly &&
    canUseSupervisorTools(hasOperational) &&
    Boolean(conversationId);
  const supervisor = useConversationSupervisor(conversationId, enabled);

  const [whisperText, setWhisperText] = useState("");
  const [controlMessage, setControlMessage] = useState("");
  const [closeReason, setCloseReason] = useState("");
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (!conversationId || !enabled) return null;

  const isControlling =
    Boolean(supervisorControlUserId) &&
    Boolean(currentUserId) &&
    supervisorControlUserId === currentUserId;

  const canClose = canSupervisorCloseChat(hasOperational);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setStatus(null);
    try {
      await fn();
      onActionComplete?.();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String(
              (err as { response?: { data?: { message?: string } } }).response?.data
                ?.message ?? "Request failed.",
            )
          : "Request failed.";
      setStatus(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        flexShrink: 0,
        borderTop: `1px solid ${theme.app.dashboard.cardBorder}`,
      }}
    >
      <ChatSideToolCard
        accent="supervisor"
        title="Monitor actions"
        subtitle="Whisper to the assigned agent, take direct control, or request a transfer while monitoring."
      >
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
          onClick={() =>
            void run(async () => {
              await supervisor.sendWhisper(whisperText.trim());
              setWhisperText("");
              setStatus("Whisper sent (agent only, not visible to visitor).");
            })
          }
        >
          Send whisper
        </Button>

        {!isControlling ? (
          <Button
            type="button"
            variant="primary"
            size="small"
            fullWidth
            sx={{ ...gradientPrimaryButtonSx, mt: 1.5 }}
            disabled={busy}
            onClick={() =>
              void run(async () => {
                await startDirectSupervisorControl(conversationId);
                setStatus("You are controlling this chat. The assigned agent is read-only.");
              })
            }
          >
            Take over chat (direct)
          </Button>
        ) : (
          <>
            <InputField
              label="Message to visitor"
              value={controlMessage}
              onChange={(e) => setControlMessage(e.target.value)}
              disabled={busy}
              sx={{ mt: 1.5 }}
            />
            <Button
              type="button"
              variant="primary"
              size="small"
              fullWidth
              sx={{ ...gradientPrimaryButtonSx, mt: 1 }}
              disabled={busy || !controlMessage.trim()}
              onClick={() =>
                void run(async () => {
                  await sendSupervisorControlMessage(
                    conversationId,
                    controlMessage.trim(),
                  );
                  setControlMessage("");
                  setStatus("Message sent to visitor.");
                  onMessageSent?.();
                })
              }
            >
              Send to visitor
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="small"
              fullWidth
              sx={{ mt: 1 }}
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await releaseDirectSupervisorControl(conversationId);
                  setStatus("Chat returned to the assigned agent.");
                })
              }
            >
              Return chat to agent
            </Button>
          </>
        )}

        {!isControlling ? (
          <Button
            type="button"
            variant="secondary"
            size="small"
            fullWidth
            sx={{ mt: 1, minWidth: 0 }}
            disabled={busy}
            onClick={() =>
              void run(async () => {
                await supervisor.requestTakeover({});
                setStatus("Takeover request submitted (if approval is required).");
              })
            }
          >
            Request transfer takeover
          </Button>
        ) : null}

        {canClose ? (
          <>
            {!closeDialogOpen ? (
              <Button
                type="button"
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mt: 1.5, borderColor: theme.app.dashboard.cardBorder }}
                disabled={busy}
                onClick={() => setCloseDialogOpen(true)}
              >
                Close chat
              </Button>
            ) : (
              <Box sx={{ mt: 1.5 }}>
                <InputField
                  label="Close reason"
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  disabled={busy}
                  multiline
                  minRows={2}
                  placeholder="Why is this chat being closed?"
                />
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Button
                    type="button"
                    variant="primary"
                    size="small"
                    sx={{ ...gradientPrimaryButtonSx, flex: 1 }}
                    disabled={busy || !closeReason.trim()}
                    onClick={() =>
                      void run(async () => {
                        await supervisorCloseConversation(conversationId, {
                          reason: closeReason.trim(),
                        });
                        setCloseReason("");
                        setCloseDialogOpen(false);
                        setStatus("Chat closed.");
                      })
                    }
                  >
                    Confirm close
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    disabled={busy}
                    onClick={() => {
                      setCloseDialogOpen(false);
                      setCloseReason("");
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </>
        ) : null}

        {status ? (
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1, color: theme.app.dashboard.textMuted }}
          >
            {status}
          </Typography>
        ) : null}
      </ChatSideToolCard>
    </Box>
  );
}

/** @deprecated Use MonitorActionsPanel */
export const MonitorSupervisorPanel = MonitorActionsPanel;
