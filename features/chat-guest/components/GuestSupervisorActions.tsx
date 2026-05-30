"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { ChatSideToolCard } from "@/features/chat-shared";
import { createGuestWhisper } from "@/services/chat/guest.api";
import type { StoredGuestSession } from "@/lib/chat/guest-session";

interface GuestSupervisorActionsProps {
  session: StoredGuestSession;
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
  onActionComplete,
}: GuestSupervisorActionsProps) {
  const theme = useTheme() as AppTheme;
  const [whisperText, setWhisperText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const { whisper } = session.permissions;
  if (!whisper) return null;

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
        bgcolor: theme.app.dashboard.cardBg,
      }}
    >
      <ChatSideToolCard accent="supervisor" title="Supervisor actions" subtitle={sessionLabel}>
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
