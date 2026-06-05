"use client";

import { useCallback, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  getAccessToken,
  postAgentAiSuggestion,
  parseAgentSuggestResponse,
} from "@/api";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import { buildAgentCopilotInput, agentAiActionNeedsWebsite } from "@/lib/ai/agent-copilot-input";
import { Button, InputField, Typography } from "@/components/common";
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
  chatOpsAgentAssignPillSx,
  chatOpsConversationMetaChipHeight,
  chatOpsStatusChipSx,
} from "@/features/chat-operations/styles/chat-operations.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import {
  PanelColumn,
  PanelHeader,
  QueueAvatar,
} from "@/features/chat-operations/styles/chat-operations.styled";
import { useConversationTypingEntries } from "@/lib/hooks/chat/useConversationTyping";
import { typingEntriesToPreviews } from "@/lib/hooks/chat/typing-preview-display";
import { extractVisitorPresentation } from "@/services/chat/visitor-presentation";
import { agentDisplayName } from "@/services/chat/monitor-normalizers";
import type { MonitorConversationRow } from "@/services/chat/monitor.types";
import type { ChatMessage } from "@/services/chat/chat.types";
import { getSharedAgentChatSocket } from "@/services/chat/sharedAgentChatSocket";
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
  /** Archive transcript page — no live header/tools; message thread fills the pane. */
  layout?: "live" | "archive";
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
  layout = "live",
  supervisorControlUserId = null,
  visitorTyping = false,
  onSupervisorAction,
  onMessageSent,
}: MonitorTranscriptPanelProps) {
  const theme = useTheme() as AppTheme;
  const socketClient = useMemo(() => getSharedAgentChatSocket(), []);
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

  const remoteTypingEntries = useConversationTypingEntries(conversationId, {
    excludeUserId: currentUserId,
  });
  const typingPreviews = useMemo(
    () =>
      typingEntriesToPreviews(remoteTypingEntries, {
        visitorDisplayName: title,
        agentDisplayName: agentLabel,
      }),
    [agentLabel, remoteTypingEntries, title],
  );
  const anyoneTyping = remoteTypingEntries.length > 0;

  const emitStopTyping = useCallback(() => {
    if (!conversationId || isClosed || !isControlling) return;
    socketClient.emitStopTyping({
      conversationId,
      userType: "agent",
      ...(currentUserId ? { userId: currentUserId } : {}),
    });
  }, [conversationId, currentUserId, isClosed, isControlling, socketClient]);

  const emitTyping = useCallback(
    (draft?: string) => {
      if (!conversationId || isClosed || !isControlling) return;
      const text = typeof draft === "string" ? draft : "";
      if (!text.trim()) {
        emitStopTyping();
        return;
      }
      socketClient.emitTyping({
        conversationId,
        userType: "agent",
        ...(currentUserId ? { userId: currentUserId } : {}),
        draft: text,
      });
    },
    [conversationId, currentUserId, emitStopTyping, isClosed, isControlling, socketClient],
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

  const isArchive = layout === "archive";

  return (
    <PanelColumn
      sx={{
        flex: 1,
        minHeight: 0,
        height: isArchive ? "auto" : "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!isArchive && hasConversation ? (
        <PanelHeader
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            py: 1.5,
            px: 2,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, minWidth: 0, flex: 1 }}>
            <QueueAvatar sx={{ width: 44, height: 44, fontSize: 14, flexShrink: 0 }}>
              {visitorInfo.initials}
            </QueueAvatar>
            <Box sx={{ minWidth: 0, pt: 0.15 }}>
              <Typography
                fontWeight={700}
                sx={{ fontSize: 15, lineHeight: 1.3, color: theme.app.text.primary }}
              >
                {title}
              </Typography>
              {subtitle ? (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.35,
                    color: theme.app.dashboard.textMuted,
                    fontSize: 11,
                    lineHeight: 1.45,
                  }}
                >
                  {subtitle}
                </Typography>
              ) : null}
              <Box
                sx={{
                  display: "flex",
                  gap: 0.75,
                  mt: 0.85,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Chip
                  label={conversation!.status}
                  size="small"
                  sx={{
                    ...chatOpsStatusChipSx,
                    textTransform: "capitalize",
                  }}
                />
                <Box
                  component="span"
                  sx={mergeSx(chatOpsAgentAssignPillSx, {
                    color: theme.app.text.primary,
                    fontWeight: 600,
                  })}
                >
                  {agentLabel}
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flexShrink: 0,
              alignSelf: "center",
            }}
          >
            {!isClosed ? (
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  height: chatOpsConversationMetaChipHeight,
                  boxSizing: "border-box",
                  px: 1,
                  py: 0,
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  color: anyoneTyping
                    ? theme.app.dashboard.accentCyan
                    : theme.palette.success.light,
                  bgcolor: anyoneTyping
                    ? alpha(theme.app.dashboard.accentCyan, 0.14)
                    : alpha(theme.palette.success.main, 0.14),
                  border: `1px solid ${alpha(
                    visitorTyping ? theme.app.dashboard.accentCyan : theme.palette.success.main,
                    0.28,
                  )}`,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: anyoneTyping
                      ? theme.app.dashboard.accentCyan
                      : theme.palette.success.main,
                  }}
                />
                {anyoneTyping ? "Typing" : "Online"}
              </Box>
            ) : null}
            {canClose ? (
              <Button
                type="button"
                variant="secondary"
                size="compact"
                onClick={() => setCloseDialogOpen(true)}
                sx={{
                  minWidth: 0,
                  height: chatOpsConversationMetaChipHeight,
                  px: 1.25,
                  py: 0,
                  fontSize: 11,
                }}
              >
                Close
              </Button>
            ) : null}
          </Box>
        </PanelHeader>
      ) : null}

      {isArchive && hasConversation ? (
        <Box
          sx={{
            px: 2,
            py: 1,
            flexShrink: 0,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1,
            borderBottom: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.22)}`,
            bgcolor: alpha(theme.app.dashboard.headerBg, 0.35),
          }}
        >
          <QueueAvatar sx={{ width: 36, height: 36, fontSize: 12 }}>{visitorInfo.initials}</QueueAvatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography fontWeight={700} sx={{ fontSize: 14, color: theme.app.text.primary }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <Chip label={conversation!.status} size="small" sx={{ height: 22, fontSize: 11 }} />
          <Chip
            label={`Agent: ${agentLabel}`}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: 11 }}
          />
          <Chip
            label={`${messages.length} messages`}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: 11 }}
          />
        </Box>
      ) : null}

      {!isArchive && (
      <Dialog
        open={closeDialogOpen}
        onClose={() => !closeBusy && setCloseDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: theme.app.dashboard.cardBg,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            minWidth: { xs: "92vw", sm: 400 },
          },
        }}
      >
        <DialogTitle sx={{ color: theme.app.text.primary, fontWeight: 700, pb: 0.5 }}>
          Close this chat?
        </DialogTitle>
        <DialogContent>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
            End the live session with{" "}
            <Box component="span" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
              {title}
            </Box>
            . A close reason is required.
          </Typography>
          <InputField
            label="Close reason"
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value)}
            disabled={closeBusy}
            multiline
            minRows={3}
            placeholder="Why is this chat being closed?"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            type="button"
            variant="secondary"
            disabled={closeBusy}
            onClick={() => {
              setCloseDialogOpen(false);
              setCloseReason("");
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={closeBusy || !closeReason.trim()}
            sx={gradientPrimaryButtonSx}
            onClick={() => void confirmClose()}
          >
            {closeBusy ? "Closing…" : "Confirm close"}
          </Button>
        </DialogActions>
      </Dialog>
      )}

      {!isArchive && (isControlling ? (
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
      ) : null)}

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
            typingPreviews={typingPreviews}
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
          onTyping={emitTyping}
          onStopTyping={emitStopTyping}
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
