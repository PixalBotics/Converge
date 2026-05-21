"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  canApproveTakeover,
  canRequestTakeover,
  canWhisper,
} from "@/lib/permissions/chat-access";
import type { ChatTakeoverRequest } from "@/services/chat/supervisor.types";
import type { useConversationSupervisor } from "../hooks/useConversationSupervisor";
import { CloseChatPanel } from "../styles/chat-operations.styled";

function userLabel(u?: { firstName?: string | null; lastName?: string | null; email?: string }): string {
  if (!u) return "User";
  const n = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return n || u.email || "User";
}

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
  const [takeoverNote, setTakeoverNote] = useState("");
  const [targetAgentId, setTargetAgentId] = useState("");
  const [busy, setBusy] = useState(false);

  const showWhisper = canWhisper(hasOperational);
  const showTakeover = canRequestTakeover(hasOperational);
  const showApprove = canApproveTakeover(hasOperational);

  if (!conversationId || (!showWhisper && !showTakeover && !showApprove)) {
    return null;
  }

  const pending = supervisor.takeoverRequests.filter((r) => r.status === "pending");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <CloseChatPanel sx={{ mt: 2 }}>
      <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1 }}>
        Supervisor tools
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
        Whispers are never visible to visitors.
      </Typography>

      {showWhisper && assignedAgentId && assignedAgentId !== currentUserId ? (
        <Box sx={{ mb: 2 }}>
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
              })
            }
          >
            Send whisper
          </Button>
        </Box>
      ) : null}

      {showTakeover ? (
        <Box sx={{ mb: 2 }}>
          <InputField
            label="Takeover note (optional)"
            value={takeoverNote}
            onChange={(e) => setTakeoverNote(e.target.value)}
            disabled={busy}
          />
          <InputField
            label="Target agent ID (optional)"
            value={targetAgentId}
            onChange={(e) => setTargetAgentId(e.target.value)}
            disabled={busy}
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", my: 0.5 }}>
            Leave target blank to assign to yourself when approved.
          </Typography>
          <Button
            type="button"
            variant="primary"
            size="small"
            fullWidth
            sx={gradientPrimaryButtonSx}
            disabled={busy || pending.length > 0}
            onClick={() =>
              void run(async () => {
                await supervisor.requestTakeover({
                  ...(targetAgentId.trim() ? { targetAgentId: targetAgentId.trim() } : {}),
                  ...(takeoverNote.trim() ? { note: takeoverNote.trim() } : {}),
                });
                setTakeoverNote("");
                setTargetAgentId("");
              })
            }
          >
            Request takeover
          </Button>
        </Box>
      ) : null}

      {supervisor.takeoverRequests.length > 0 ? (
        <>
          <Divider sx={{ my: 1.5, borderColor: alpha(theme.app.dashboard.cardBorder, 0.3) }} />
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: "block" }}>
            Takeover requests
          </Typography>
          {supervisor.takeoverRequests.map((req: ChatTakeoverRequest) => (
            <Box
              key={req.id}
              sx={{
                mb: 1,
                p: 1,
                borderRadius: 1.5,
                bgcolor: alpha(theme.app.dashboard.overlayLight, 0.35),
              }}
            >
              <Chip label={req.status} size="small" sx={{ mb: 0.5, height: 20, fontSize: 10 }} />
              <Typography variant="caption" sx={{ display: "block", fontSize: 11 }}>
                {userLabel(req.requestedBy)} → {userLabel(req.targetAgent)}
              </Typography>
              {req.note ? (
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                  {req.note}
                </Typography>
              ) : null}
              {showApprove && req.status === "pending" ? (
                <Box sx={{ display: "flex", gap: 0.75, mt: 0.75 }}>
                  <Button
                    type="button"
                    size="small"
                    variant="primary"
                    disabled={busy}
                    onClick={() => void run(() => supervisor.approveTakeover(req.id))}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    disabled={busy}
                    onClick={() => void run(() => supervisor.rejectTakeover(req.id))}
                  >
                    Reject
                  </Button>
                </Box>
              ) : null}
            </Box>
          ))}
        </>
      ) : null}

      {supervisor.whispers.length > 0 && showWhisper ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: 1 }}>
          {supervisor.whispers.length} whisper(s) on record
        </Typography>
      ) : null}
    </CloseChatPanel>
  );
}
