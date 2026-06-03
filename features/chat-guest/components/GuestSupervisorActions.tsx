"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  createGuestWhisper,
  releaseGuestDirectControl,
  sendGuestDirectControlMessage,
  startGuestDirectControl,
} from "@/services/chat/guest.api";
import type { StoredGuestSession } from "@/lib/chat/guest-session";
import {
  guestSupervisorColumnSx,
  guestSupervisorGridSx,
  guestSupervisorSidebarSx,
} from "../styles/chat-guest.styles";

interface GuestSupervisorActionsProps {
  session: StoredGuestSession;
  supervisorControlUserId?: string | null;
  assignedAgentId?: string | null;
  chatCompleted?: boolean;
  layout?: "sidebar" | "stacked";
  onOptimisticAgentMessage?: (content: string) => void;
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
  layout = "stacked",
  onOptimisticAgentMessage,
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
    whisper && Boolean(assignedAgentId) && !isControlling && !chatCompleted;

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

  const sessionLabel = `${session.websiteLabel ? `${session.websiteLabel} · ` : ""}${session.departmentName ?? "Department"}`;
  const isSidebar = layout === "sidebar";

  const whisperBlock = showWhisper ? (
    <Box sx={guestSupervisorColumnSx} order={{ xs: 1, sm: 1 }}>
      <Typography fontWeight={700} sx={{ fontSize: 13, color: theme.app.text.primary }}>
        Whisper
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.4 }}>
        Private note to the agent — visitor cannot see this.
      </Typography>
      <InputField
        label="Message for agent"
        placeholder="e.g. offer a discount or escalate"
        value={whisperText}
        onChange={(e) => setWhisperText(e.target.value)}
        disabled={busy}
        multiline
        minRows={2}
      />
      <Button
        type="button"
        variant="outlined"
        size="small"
        fullWidth
        disabled={busy || !whisperText.trim()}
        onClick={() =>
          void run(async () => {
            await createGuestWhisper(
              session.conversationId,
              session.accessToken,
              whisperText.trim(),
            );
            setWhisperText("");
            setStatus("Whisper sent to the agent.");
          })
        }
      >
        Send whisper
      </Button>
    </Box>
  ) : null;

  const takeoverBlock = showDirectControl ? (
    <Box sx={guestSupervisorColumnSx} order={{ xs: 2, sm: 2 }}>
      <Typography fontWeight={700} sx={{ fontSize: 13, color: theme.app.text.primary }}>
        Take over
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.4 }}>
        Reply to the visitor yourself; the assigned agent becomes read-only.
      </Typography>
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
              await startGuestDirectControl(session.conversationId, session.accessToken);
              setStatus("You are controlling this chat.");
            })
          }
        >
          Take over chat
        </Button>
      ) : (
        <>
          <InputField
            label="Message to visitor"
            placeholder="Type your reply…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={busy}
            multiline
            minRows={2}
          />
          <Button
            type="button"
            variant="primary"
            size="small"
            fullWidth
            sx={gradientPrimaryButtonSx}
            disabled={busy || !replyText.trim()}
            onClick={() =>
              void run(async () => {
                const text = replyText.trim();
                onOptimisticAgentMessage?.(text);
                await sendGuestDirectControlMessage(
                  session.conversationId,
                  session.accessToken,
                  text,
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
            disabled={busy}
            onClick={() =>
              void run(async () => {
                await releaseGuestDirectControl(session.conversationId, session.accessToken);
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
    <Box sx={guestSupervisorColumnSx} order={{ xs: 2, sm: 2 }}>
      <Typography fontWeight={700} sx={{ fontSize: 13, color: theme.app.text.primary }}>
        Take over
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.4 }}>
        Takeover requires a supervisor account linked to this link email.
      </Typography>
    </Box>
  ) : null;

  const gridColumns =
    showWhisper && (showDirectControl || (directControl && !involvementUserId))
      ? { xs: "1fr", sm: "1fr 1fr" }
      : "1fr";

  const content = (
    <>
      <Typography
        variant="caption"
        sx={{
          px: isSidebar ? 2 : 0,
          pt: isSidebar ? 1.5 : 0,
          pb: 0.5,
          color: theme.app.dashboard.textMuted,
          fontWeight: 600,
          letterSpacing: 0.3,
          textTransform: "uppercase",
          fontSize: 10,
        }}
      >
        Supervisor · {sessionLabel}
      </Typography>
      <Box sx={{ ...guestSupervisorGridSx, gridTemplateColumns: gridColumns, pt: 0 }}>
        {whisperBlock}
        {takeoverBlock}
      </Box>
      {status ? (
        <Typography
          variant="caption"
          sx={{
            px: 2,
            pb: 1.5,
            color: theme.app.dashboard.accentGreenLight,
            lineHeight: 1.45,
          }}
        >
          {status}
        </Typography>
      ) : null}
    </>
  );

  if (isSidebar) {
    return <Box sx={guestSupervisorSidebarSx}>{content}</Box>;
  }

  const cardSurfaceSx =
    typeof theme.app.dashboard.cardBg === "string" &&
    /gradient/i.test(theme.app.dashboard.cardBg)
      ? { background: theme.app.dashboard.cardBg }
      : { bgcolor: theme.app.dashboard.cardBg };

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        flexShrink: 0,
        borderTop: `1px solid ${theme.app.dashboard.cardBorder}`,
        ...cardSurfaceSx,
      }}
    >
      {content}
    </Box>
  );
}
