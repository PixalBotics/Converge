"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { ChatSideToolCard } from "@/features/chat-shared";
import { dashboardCardSurfaceProps } from "@/features/chat-operations/styles/chat-semantic";
import {
  createGuestWhisper,
  releaseGuestDirectControl,
  sendGuestDirectControlMessage,
  startGuestDirectControl,
} from "@/services/chat/guest.api";
import type { StoredGuestSession } from "@/lib/chat/guest-session";

interface GuestSupervisorActionsProps {
  session: StoredGuestSession;
  supervisorControlUserId?: string | null;
  assignedAgentId?: string | null;
  chatCompleted?: boolean;
  onActionComplete?: () => void;
}

function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: { message?: string | string[] } } }).response?.data;
    const msg = data?.message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg) && msg[0]) return String(msg[0]);
  }
  return "Request failed. Try again.";
}

export function GuestSupervisorActions({
  session,
  supervisorControlUserId,
  assignedAgentId,
  chatCompleted = false,
  onActionComplete,
}: GuestSupervisorActionsProps) {
  const theme = useTheme() as AppTheme;
  const [whisperText, setWhisperText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const { whisper, directControl } = session.permissions;
  const involvementUserId = session.involvementUserId ?? null;
  const isControlling =
    Boolean(supervisorControlUserId) &&
    Boolean(involvementUserId) &&
    supervisorControlUserId === involvementUserId;

  const showWhisper =
    whisper &&
    Boolean(assignedAgentId) &&
    !isControlling &&
    !chatCompleted;

  const showDirectControl = directControl && Boolean(involvementUserId) && !chatCompleted;

  if (!showWhisper && !showDirectControl) return null;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setStatus(null);
    try {
      await fn();
      onActionComplete?.();
    } catch (err) {
      setStatus(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const sessionLabel = `${session.websiteLabel ? `${session.websiteLabel} · ` : ""}${session.departmentName ?? "Department"} guest session`;

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        flexShrink: 0,
        borderTop: `1px solid ${theme.app.dashboard.cardBorder}`,
        ...dashboardCardSurfaceProps(theme),
      }}
    >
      <ChatSideToolCard accent="supervisor" title="Supervisor actions" subtitle={sessionLabel}>
        {showDirectControl ? (
          <Box sx={{ mb: showWhisper ? 1.25 : 0 }}>
            {!isControlling ? (
              <Button
                type="button"
                variant="primary"
                size="small"
                fullWidth
                sx={gradientPrimaryButtonSx}
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await startGuestDirectControl(
                      session.conversationId,
                      session.accessToken,
                    );
                    setStatus("You are controlling this chat. Messages you send are visible to the visitor.");
                  })
                }
              >
                Take over chat
              </Button>
            ) : (
              <>
                <Typography
                  variant="caption"
                  sx={{ display: "block", mb: 1, color: theme.app.dashboard.textMuted }}
                >
                  You are replying as supervisor (agent is read-only).
                </Typography>
                <InputField
                  label="Message to visitor"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={busy}
                />
                <Button
                  type="button"
                  variant="primary"
                  size="small"
                  fullWidth
                  sx={{ ...gradientPrimaryButtonSx, mt: 1 }}
                  disabled={busy || !replyText.trim()}
                  onClick={() =>
                    void run(async () => {
                      await sendGuestDirectControlMessage(
                        session.conversationId,
                        session.accessToken,
                        replyText.trim(),
                      );
                      setReplyText("");
                      setStatus("Message sent to the visitor.");
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
                      await releaseGuestDirectControl(
                        session.conversationId,
                        session.accessToken,
                      );
                      setStatus("Chat returned to the assigned agent.");
                    })
                  }
                >
                  Release control
                </Button>
              </>
            )}
          </Box>
        ) : directControl && !involvementUserId ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
            Takeover requires an involvement supervisor account linked to this link email.
          </Typography>
        ) : null}

        {showWhisper ? (
          <Box>
            <InputField
              label="Whisper to assigned agent"
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
                  await createGuestWhisper(
                    session.conversationId,
                    session.accessToken,
                    whisperText.trim(),
                  );
                  setWhisperText("");
                  setStatus("Whisper sent to the agent (not visible to the visitor).");
                })
              }
            >
              Send whisper
            </Button>
          </Box>
        ) : null}

        {status ? (
          <>
            <Divider sx={{ my: 1, borderColor: theme.app.dashboard.cardBorder }} />
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {status}
            </Typography>
          </>
        ) : null}
      </ChatSideToolCard>
    </Box>
  );
}
