"use client";

import { useCallback, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  getAccessToken,
  postAgentAiSuggestion,
  parseAgentSuggestResponse,
} from "@/api";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import { buildAgentCopilotInput, agentAiActionNeedsWebsite } from "@/lib/ai/agent-copilot-input";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { ChatComposer } from "@/features/chat-operations/components/ChatComposer";
import { ChatMessageList } from "@/features/chat-operations/components/ChatMessageList";
import { inboxTranscriptDisplayForClosed } from "@/features/chat-operations/utils/inbox-transcript-messages";
import {
  getConversationAiState,
  getConversationDraft,
  patchConversationAiState,
  patchConversationDraft,
} from "@/features/chat-operations/utils/conversation-scoped-state";
import { parseVisitorInfo } from "@/features/chat-operations/utils/visitor-info";
import {
  ChatHeaderMetaChip,
  PanelColumn,
  PanelHeader,
  QueueAvatar,
} from "@/features/chat-operations/styles/chat-operations.styled";
import { extractVisitorPresentation } from "@/services/chat/visitor-presentation";
import { agentDisplayName } from "@/services/chat/monitor-normalizers";
import type { MonitorConversationRow } from "@/services/chat/monitor.types";
import type { ChatMessage } from "@/services/chat/chat.types";
import {
  sendSupervisorControlMessage,
  supervisorCloseConversation,
} from "@/services/chat/supervisor.api";
import { canSupervisorCloseChat } from "@/lib/permissions/chat-access";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
function needsWebsite(action: AgentAiAction): boolean {
  return agentAiActionNeedsWebsite(action);
}

interface MonitorTranscriptPanelProps {
  conversation: MonitorConversationRow | null;
  messages: ChatMessage[];
  visitor: Record<string, unknown> | null;
  loading: boolean;
  loadError?: string | null;
  currentUserId?: string | null;
  hasOperational?: (p: string) => boolean;
  monitorReadOnly?: boolean;
  supervisorControlUserId?: string | null;
  visitorTyping?: boolean;
  onSupervisorAction?: () => void;
  onMessageSent?: () => void;
}

export function MonitorTranscriptPanel({
  conversation,
  messages,
  visitor,
  loading,
  loadError = null,
  currentUserId = null,
  hasOperational = () => false,
  monitorReadOnly = false,
  supervisorControlUserId = null,
  visitorTyping = false,
  onSupervisorAction,
  onMessageSent,
}: MonitorTranscriptPanelProps) {
  const theme = useTheme() as AppTheme;
  const activeSupervisorId =
    supervisorControlUserId ?? conversation?.supervisorControlUserId ?? null;
  const isControlling =
    Boolean(activeSupervisorId) &&
    Boolean(currentUserId) &&
    activeSupervisorId === currentUserId;

  const vp = conversation ? extractVisitorPresentation(conversation) : null;
  const visitorInfo = parseVisitorInfo(visitor);
  const title = vp?.inboxTitle || vp?.displayName || visitorInfo.displayName;
  const subtitle =
    vp ? [vp.originLabel, vp.locationLabel].filter(Boolean).join(" · ") : null;
  const conversationId = conversation?.id ?? null;
  const hasConversation = Boolean(conversation);
  const isClosed = conversation?.status === "closed";
  const agentLabel = agentDisplayName(conversation?.agent ?? null);
  const websiteId = conversation?.websiteId ?? null;
  const departmentId = conversation?.departmentId ?? null;

  const [draftsByConversation, setDraftsByConversation] = useState<Record<string, string>>({});
  const [aiByConversation, setAiByConversation] = useState<
    Record<string, import("@/features/chat-operations/utils/conversation-scoped-state").ConversationAiState>
  >({});
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [closeBusy, setCloseBusy] = useState(false);

  const composer = getConversationDraft(draftsByConversation, conversationId);
  const aiState = getConversationAiState(aiByConversation, conversationId);
  const canClose =
    !monitorReadOnly && canSupervisorCloseChat(hasOperational) && !isClosed;

  const transcriptDisplay = useMemo(
    () =>
      isClosed ? inboxTranscriptDisplayForClosed(messages) : undefined,
    [isClosed, messages],
  );

  const setComposer = useCallback(
    (value: string | ((prev: string) => string)) => {
      if (!conversationId) return;
      setDraftsByConversation((prev) => patchConversationDraft(prev, conversationId, value));
    },
    [conversationId],
  );

  const setAiPrompt = useCallback(
    (value: string) => {
      if (!conversationId) return;
      setAiByConversation((prev) =>
        patchConversationAiState(prev, conversationId, { prompt: value }),
      );
    },
    [conversationId],
  );

  const pushCannedToComposer = useCallback(
    (line: string) => {
      if (!conversationId) return;
      setDraftsByConversation((prev) =>
        patchConversationDraft(prev, conversationId, (current) =>
          current ? `${current} ${line}` : line,
        ),
      );
    },
    [conversationId],
  );

  const applyAiToComposer = useCallback(
    (text: string) => {
      if (!conversationId) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      setDraftsByConversation((prev) =>
        patchConversationDraft(prev, conversationId, (current) =>
          current ? `${current}\n\n${trimmed}` : trimmed,
        ),
      );
    },
    [conversationId],
  );

  const sendAiPrompt = useCallback(
    async (prompt: string, action: AgentAiAction = "coach_reply") => {
      const token = getAccessToken();
      if (!token || !conversationId) return;
      if (needsWebsite(action) && !websiteId?.trim()) return;

      const userId = `ai-u-${Date.now()}`;
      const pendingId = `ai-a-${Date.now()}`;
      const draftContext = getConversationDraft(draftsByConversation, conversationId).trim();

      setAiByConversation((prev) => {
        const current = getConversationAiState(prev, conversationId);
        return patchConversationAiState(prev, conversationId, {
          prompt: "",
          busy: true,
          messages: [
            ...current.messages,
            { id: userId, role: "user", content: prompt, action },
            { id: pendingId, role: "assistant", content: "", pending: true },
          ],
        });
      });

      try {
        const input = buildAgentCopilotInput({
          prompt,
          action,
          transcript: messages,
          draftReply: draftContext,
        });
        const data = await postAgentAiSuggestion({
          action,
          input,
          conversationId,
          ...(websiteId?.trim() ? { websiteId: websiteId.trim() } : {}),
          ...(action === "rewrite_tone" ? { tone: "professional" } : {}),
        });
        const parsed = parseAgentSuggestResponse(data);
        setAiByConversation((prev) => {
          const current = getConversationAiState(prev, conversationId);
          return patchConversationAiState(prev, conversationId, {
            busy: false,
            messages: current.messages.map((m) =>
              m.id === pendingId
                ? {
                    ...m,
                    content: parsed.reply,
                    sources: parsed.sources.length ? parsed.sources : undefined,
                    pending: false,
                  }
                : m,
            ),
          });
        });
      } catch (err) {
        const apiMsg = extractApiErrorMessageForToast(err);
        setAiByConversation((prev) => {
          const current = getConversationAiState(prev, conversationId);
          return patchConversationAiState(prev, conversationId, {
            busy: false,
            messages: current.messages.map((m) =>
              m.id === pendingId
                ? {
                    ...m,
                    content: apiMsg ?? "Assistant request failed.",
                    pending: false,
                  }
                : m,
            ),
          });
        });
      }
    },
    [conversationId, draftsByConversation, messages, websiteId],
  );

  const sendToVisitor = useCallback(async () => {
    if (!conversationId || !composer.trim() || !isControlling) return;
    try {
      await sendSupervisorControlMessage(conversationId, composer.trim());
      setDraftsByConversation((prev) => patchConversationDraft(prev, conversationId, ""));
      onMessageSent?.();
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Could not send message.",
      });
    }
  }, [composer, conversationId, isControlling, onMessageSent]);

  const confirmClose = useCallback(async () => {
    if (!conversationId || !closeReason.trim()) return;
    setCloseBusy(true);
    try {
      await supervisorCloseConversation(conversationId, { reason: closeReason.trim() });
      setCloseReason("");
      setCloseDialogOpen(false);
      onSupervisorAction?.();
      publishAppToast({ variant: "success", message: "Chat closed." });
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Could not close chat.",
      });
    } finally {
      setCloseBusy(false);
    }
  }, [closeReason, conversationId, onSupervisorAction]);

  return (
    <PanelColumn
      sx={{
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {hasConversation ? (
        <PanelHeader
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            py: 1.25,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, flex: 1 }}>
            <QueueAvatar sx={{ width: 40, height: 40, fontSize: 13 }}>{visitorInfo.initials}</QueueAvatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700} sx={{ fontSize: 14, color: theme.app.text.primary }}>
                {title}
              </Typography>
              {subtitle ? (
                <Typography
                  variant="caption"
                  sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}
                >
                  {subtitle}
                </Typography>
              ) : null}
              <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap", alignItems: "center" }}>
                <Chip label={conversation!.status} size="small" sx={{ height: 20, fontSize: 10 }} />
                <ChatHeaderMetaChip>
                  <Typography variant="caption" sx={{ fontSize: 10, color: theme.app.dashboard.textMuted }}>
                    Agent
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{agentLabel}</Typography>
                </ChatHeaderMetaChip>
                {canClose && !closeDialogOpen ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="compact"
                    onClick={() => setCloseDialogOpen(true)}
                    sx={{ ml: 0.5, minWidth: 0, px: 1, py: 0.25, fontSize: 11 }}
                  >
                    Close
                  </Button>
                ) : null}
              </Box>
              {closeDialogOpen ? (
                <Box sx={{ mt: 1, maxWidth: 360 }}>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
                    Close reason
                  </Typography>
                  <Box
                    component="textarea"
                    value={closeReason}
                    onChange={(e) => setCloseReason(e.target.value)}
                    disabled={closeBusy}
                    placeholder="Why is this chat being closed?"
                    sx={{
                      width: "100%",
                      mt: 0.5,
                      minHeight: 56,
                      fontSize: 12,
                      p: 1,
                      borderRadius: 1,
                      border: `1px solid ${theme.app.dashboard.cardBorder}`,
                      bgcolor: "transparent",
                      color: theme.app.text.primary,
                      resize: "vertical",
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 0.75, mt: 0.5 }}>
                    <Button
                      type="button"
                      variant="primary"
                      size="small"
                      sx={gradientPrimaryButtonSx}
                      disabled={closeBusy || !closeReason.trim()}
                      onClick={() => void confirmClose()}
                    >
                      Confirm
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      disabled={closeBusy}
                      onClick={() => {
                        setCloseDialogOpen(false);
                        setCloseReason("");
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : null}
            </Box>
          </Box>
        </PanelHeader>
      ) : null}

      {isControlling ? (
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 0.5,
            flexShrink: 0,
            fontSize: 11,
            color: theme.app.dashboard.accentBlue,
          }}
        >
          You are replying as supervisor — use the composer below (canned + AI assistant).
        </Typography>
      ) : monitorReadOnly ? (
        <Typography
          variant="caption"
          sx={{ px: 2, py: 0.5, flexShrink: 0, fontSize: 11, color: theme.app.dashboard.textMuted }}
        >
          Read-only monitor view.
        </Typography>
      ) : null}

      {loadError ? (
        <Box sx={{ p: 3 }}>
          <Typography sx={{ color: theme.palette.error.main, fontSize: 14 }}>{loadError}</Typography>
        </Box>
      ) : loading ? (
        <Box sx={{ p: 3 }}>
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading transcript…</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChatMessageList
            conversationId={conversationId}
            messages={messages}
            visitorInitials={visitorInfo.initials}
            visitorTyping={visitorTyping && !isClosed}
            visitorDisplayName={title}
            agentDisplayName={agentLabel}
            showEmptyPlaceholder={!hasConversation}
            transcriptDisplay={transcriptDisplay}
          />
        </Box>
      )}

      {isControlling && !isClosed ? (
        <ChatComposer
          value={composer}
          onChange={setComposer}
          onSend={() => void sendToVisitor()}
          onTyping={() => {}}
          onStopTyping={() => {}}
          disabled={false}
          onInsertCanned={pushCannedToComposer}
          websiteId={websiteId}
          departmentId={departmentId}
          aiMessages={aiState.messages}
          aiPrompt={aiState.prompt}
          onAiPromptChange={setAiPrompt}
          onSendAiPrompt={(prompt, action) => void sendAiPrompt(prompt, action)}
          onApplyAiToComposer={applyAiToComposer}
          aiBusy={aiState.busy}
          websiteRequiredDisabled={!websiteId?.trim()}
          hasConversation={hasConversation}
        />
      ) : null}
    </PanelColumn>
  );
}
