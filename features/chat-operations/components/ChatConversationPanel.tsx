"use client";

import { useEffect, useMemo, useState } from "react";
import MoreVert from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import type { ConversationTypingEntry } from "@/lib/hooks/chat/conversation-typing-bus";
import { typingEntriesToPreviews } from "@/lib/hooks/chat/typing-preview-display";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import type { AgentVisitorPresentation, ChatMessage } from "@/services/chat/chat.types";
import type { AiChatMessage } from "../types/ai-chat";
import { parseVisitorInfo } from "../utils/visitor-info";
import type { ChatWhisperSocketPayload } from "@/services/chat/supervisor.types";
import { ChatContextRail } from "./ChatContextRail";
import { GuestLinkHeaderAction } from "./GuestLinkHeaderAction";
import { inboxTranscriptDisplayForClosed } from "../utils/inbox-transcript-messages";
import { ChatWhisperComposerStrip } from "./ChatWhisperComposerStrip";
import { ChatComposer } from "./ChatComposer";
import { ChatMessageList, type VisitorProfileCaptureSelection } from "./ChatMessageList";
import { chatOpsConversationMetaChipHeight } from "../styles/chat-operations.styles";
import type { VisitorProfileField } from "@/services/chat/visitor-profile.types";
import {
  ChatHeaderMetaChip,
  PanelColumn,
  PanelHeader,
  QueueAvatar,
} from "../styles/chat-operations.styled";

interface ChatConversationPanelProps {
  conversationId: string | null;
  messages: ChatMessage[];
  visitor: Record<string, unknown> | null;
  conversationMeta?: Record<string, unknown> | null;
  visitorPresentation?: AgentVisitorPresentation | null;
  readOnly?: boolean;
  assignedAgentLabel?: string;
  visitorTyping: boolean;
  visitorTypingDraft?: string;
  remoteTypingEntries?: ConversationTypingEntry[];
  composer: string;
  onComposerChange: (value: string) => void;
  onSend: () => void;
  onTyping: (draft?: string) => void;
  onStopTyping: () => void;
  onInsertCanned: (text: string) => void;
  onCloseChat?: () => void;
  canSend: boolean;
  aiMessages: AiChatMessage[];
  aiPrompt: string;
  onAiPromptChange: (value: string) => void;
  onSendAiPrompt: (prompt: string, action?: AgentAiAction) => void;
  onApplyAiToComposer: (text: string) => void;
  aiBusy: boolean;
  websiteRequiredDisabled?: boolean;
  availabilityHint?: string | null;
  websiteId?: string | null;
  departmentId?: string | null;
  activeWhisper?: ChatWhisperSocketPayload | null;
  onApplyWhisperToComposer?: (text: string) => void;
  onDismissWhisper?: () => void;
  /** Fallback when post-close distribution link is not yet in transcript history. */
  distributionFormHref?: string | null;
  requiresDistributionForm?: boolean;
  hasOperational?: (p: string) => boolean;
  profileCaptureEnabled?: boolean;
  onCaptureField?: (
    field: VisitorProfileField,
    selection: VisitorProfileCaptureSelection,
  ) => void | Promise<void>;
  profileCaptureBusy?: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ChatConversationPanel({
  conversationId,
  messages,
  visitor,
  conversationMeta,
  visitorPresentation = null,
  readOnly = false,
  assignedAgentLabel = "You",
  visitorTyping,
  visitorTypingDraft = "",
  remoteTypingEntries = [],
  composer,
  onComposerChange,
  onSend,
  onTyping,
  onStopTyping,
  onInsertCanned,
  onCloseChat,
  canSend,
  aiMessages,
  aiPrompt,
  onAiPromptChange,
  onSendAiPrompt,
  onApplyAiToComposer,
  aiBusy,
  websiteRequiredDisabled = false,
  availabilityHint = null,
  websiteId = null,
  departmentId = null,
  activeWhisper = null,
  onApplyWhisperToComposer,
  onDismissWhisper,
  distributionFormHref = null,
  requiresDistributionForm = false,
  hasOperational = () => false,
  profileCaptureEnabled = false,
  onCaptureField,
  profileCaptureBusy = false,
}: ChatConversationPanelProps) {
  const theme = useTheme() as AppTheme;
  const visitorInfo = parseVisitorInfo(visitor, conversationMeta ?? undefined);
  const headerTitle =
    visitorPresentation?.inboxTitle?.trim() ||
    visitorPresentation?.displayName?.trim() ||
    visitorInfo.displayName;
  const headerSubtitle =
    visitorPresentation
      ? [visitorPresentation.originLabel, visitorPresentation.locationLabel]
          .filter(Boolean)
          .join(" · ")
      : null;
  const [elapsedSec, setElapsedSec] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const sessionStartMs = visitorInfo.sessionStartedAt
    ? new Date(visitorInfo.sessionStartedAt).getTime()
    : messages[0]?.createdAt
      ? new Date(messages[0].createdAt).getTime()
      : null;

  useEffect(() => {
    if (!conversationId || !sessionStartMs || Number.isNaN(sessionStartMs)) {
      setElapsedSec(0);
      return;
    }
    const tick = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - sessionStartMs) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [conversationId, sessionStartMs]);

  const pageCount = Math.max(visitorInfo.journey.length, visitorInfo.currentPageUrl ? 1 : 0);

  const hasConversation = Boolean(conversationId);

  const transcriptDisplay = useMemo(() => {
    const fromMessages = inboxTranscriptDisplayForClosed(messages);
    if (fromMessages) return fromMessages;
    if (
      readOnly &&
      requiresDistributionForm &&
      distributionFormHref?.trim()
    ) {
      return {
        requiresDistributionForm: true,
        distributionFormHref: distributionFormHref.trim(),
      };
    }
    if (!readOnly) {
      return { hidePostCloseForms: true };
    }
    return undefined;
  }, [messages, readOnly, requiresDistributionForm, distributionFormHref]);

  const typingPreviews = useMemo(
    () =>
      typingEntriesToPreviews(remoteTypingEntries, {
        visitorDisplayName: visitorInfo.displayName,
        agentDisplayName: assignedAgentLabel,
      }),
    [assignedAgentLabel, remoteTypingEntries, visitorInfo.displayName],
  );

  return (
    <PanelColumn
      sx={{
        flex: 1,
        minHeight: 0,
        height: "100%",
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
            gap: { xs: 1.5, sm: 2 },
            py: 1.5,
            px: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              minWidth: 0,
              flex: 1,
              pr: { sm: 1 },
            }}
          >
            <QueueAvatar sx={{ width: 44, height: 44, fontSize: 14, flexShrink: 0 }}>
              {visitorInfo.initials}
            </QueueAvatar>
            <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 0.35 }}>
              <Typography
                fontWeight={700}
                sx={{
                  fontSize: 15,
                  lineHeight: 1.3,
                  color: theme.app.text.primary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {headerTitle}
              </Typography>
              {headerSubtitle ? (
                <Typography
                  sx={{
                    fontSize: 11,
                    lineHeight: 1.4,
                    color: theme.app.dashboard.textMuted,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {headerSubtitle}
                </Typography>
              ) : null}
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  gap: 0.5,
                  mt: 0.15,
                  height: chatOpsConversationMetaChipHeight,
                  boxSizing: "border-box",
                  px: 1,
                  py: 0,
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  color: readOnly
                    ? theme.app.dashboard.textMuted
                    : visitorTyping
                      ? theme.app.dashboard.accentCyan
                      : theme.palette.success.light,
                  bgcolor: readOnly
                    ? alpha(theme.app.dashboard.textMuted, 0.12)
                    : visitorTyping
                      ? alpha(theme.app.dashboard.accentCyan, 0.14)
                      : alpha(theme.palette.success.main, 0.14),
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: readOnly
                      ? theme.app.dashboard.textMuted
                      : visitorTyping
                        ? theme.app.dashboard.accentCyan
                        : theme.palette.success.main,
                  }}
                />
                {readOnly ? "Closed" : visitorTyping ? "Typing" : "Online"}
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 0.75,
              flexShrink: 0,
              ml: { xs: 0, sm: 1.5 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "nowrap",
              }}
            >
              {!readOnly ? (
                <GuestLinkHeaderAction
                  conversationId={conversationId}
                  hasOperational={hasOperational}
                />
              ) : null}
              {onCloseChat ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="compact"
                    onClick={() => void onCloseChat()}
                    sx={{
                      display: { xs: "none", md: "inline-flex" },
                      minWidth: 0,
                      height: chatOpsConversationMetaChipHeight,
                      px: 1.5,
                      py: 0,
                      fontSize: 11,
                    }}
                  >
                    Close chat
                  </Button>
                  <IconButton
                    size="small"
                    aria-label="More actions"
                    onClick={(e) => setMenuAnchor(e.currentTarget)}
                    sx={{ color: theme.app.dashboard.iconMuted, display: { md: "none" } }}
                  >
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                    slotProps={{
                      paper: {
                        sx: {
                          bgcolor: theme.app.dashboard.menuSurfaceBg,
                          border: `1px solid ${theme.app.dashboard.cardBorder}`,
                        },
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        setMenuAnchor(null);
                        onCloseChat();
                      }}
                      sx={{ color: theme.palette.error.light }}
                    >
                      Close conversation
                    </MenuItem>
                  </Menu>
                </>
              ) : null}
            </Box>
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                gap: 1,
                flexWrap: "nowrap",
                alignItems: "center",
              }}
            >
              <ChatHeaderMetaChip>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 10 }}>
                  Session
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: theme.app.text.primary }}>
                  {formatDuration(elapsedSec)}
                </Typography>
              </ChatHeaderMetaChip>
              <ChatHeaderMetaChip>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 10 }}>
                  Pages
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: theme.app.text.primary }}>
                  {pageCount}
                </Typography>
              </ChatHeaderMetaChip>
            </Box>
          </Box>
        </PanelHeader>
      ) : null}

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
          transcriptDisplay={transcriptDisplay}
          visitorInitials={visitorInfo.initials}
          visitorTyping={visitorTyping}
          visitorTypingDraft={visitorTypingDraft}
          typingPreviews={typingPreviews}
          visitorDisplayName={visitorInfo.displayName}
          agentDisplayName={assignedAgentLabel}
          showEmptyPlaceholder={!hasConversation}
          profileCaptureEnabled={profileCaptureEnabled}
          onCaptureField={onCaptureField}
          profileCaptureBusy={profileCaptureBusy}
        />
      </Box>

      <ChatContextRail
        hasConversation={hasConversation}
        readOnly={readOnly}
        availabilityHint={availabilityHint}
      />

      {activeWhisper && onApplyWhisperToComposer && onDismissWhisper && !readOnly ? (
        <ChatWhisperComposerStrip
          payload={activeWhisper}
          onInsert={(text) => {
            onApplyWhisperToComposer(text);
            onDismissWhisper();
          }}
          onDismiss={onDismissWhisper}
        />
      ) : null}

      <ChatComposer
        value={composer}
        onChange={onComposerChange}
        onSend={onSend}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        disabled={!canSend || readOnly}
        onInsertCanned={onInsertCanned}
        websiteId={websiteId}
        departmentId={departmentId}
        aiMessages={aiMessages}
        aiPrompt={aiPrompt}
        onAiPromptChange={onAiPromptChange}
        onSendAiPrompt={onSendAiPrompt}
        onApplyAiToComposer={onApplyAiToComposer}
        aiBusy={aiBusy}
        websiteRequiredDisabled={websiteRequiredDisabled}
        hasConversation={hasConversation}
      />
    </PanelColumn>
  );
}
