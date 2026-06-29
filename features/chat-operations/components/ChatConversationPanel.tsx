"use client";

import { useEffect, useMemo, useState } from "react";
import MoreVert from "@mui/icons-material/MoreVert";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
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
import { ChatTranscriptStatusChip } from "./ChatTranscriptStatusChip";
import {
  CLOSED_CHAT_BUCKETS,
  resolveClosedChatBucket,
} from "../utils/chat-close-outcome";
import { GuestLinkHeaderAction } from "./GuestLinkHeaderAction";
import { TransferChatHeaderAction } from "./TransferChatHeaderAction";
import { inboxTranscriptDisplayForClosed } from "../utils/inbox-transcript-messages";
import { ChatWhisperComposerStrip } from "./ChatWhisperComposerStrip";
import { ChatComposer } from "./ChatComposer";
import { ChatDistributionLinkBanner } from "./ChatDistributionLinkBanner";
import { ChatMessageList, type VisitorProfileCaptureSelection } from "./ChatMessageList";
import { chatOpsConversationMetaChipHeight, chatOpsBackButtonSx } from "../styles/chat-operations.styles";
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
  onDismissConversation?: () => void;
  /** Show back control in the transcript header (queue / list). */
  showBackButton?: boolean;
  onMarkSpam?: () => void;
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
  distributionSubmitted?: boolean;
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
  onDismissConversation,
  onMarkSpam,
  showBackButton = false,
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
  distributionSubmitted = false,
  hasOperational = () => false,
  profileCaptureEnabled = false,
  onCaptureField,
  profileCaptureBusy = false,
}: ChatConversationPanelProps) {
  const theme = useTheme() as AppTheme;
  const visitorInfo = parseVisitorInfo(visitor, conversationMeta ?? undefined);
  const serviceChannel =
    typeof conversationMeta?.serviceChannel === "string"
      ? conversationMeta.serviceChannel
      : null;
  const lastTransferFrom =
    conversationMeta?.lastTransferFrom &&
    typeof conversationMeta.lastTransferFrom === "object" &&
    typeof (conversationMeta.lastTransferFrom as { label?: string }).label ===
      "string"
      ? (conversationMeta.lastTransferFrom as {
          label: string;
          userId?: string;
          transferredAt?: string;
        })
      : null;
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
    const closeBucket = conversationMeta
      ? resolveClosedChatBucket({
          closeBucket:
            typeof conversationMeta.closeBucket === "string"
              ? conversationMeta.closeBucket
              : null,
          closeOutcome:
            typeof conversationMeta.closeOutcome === "string"
              ? conversationMeta.closeOutcome
              : null,
          requiresDistributionForm: Boolean(conversationMeta.requiresDistributionForm),
          distributionSubmitted: Boolean(conversationMeta.distributionSubmitted),
        })
      : null;

    if (!readOnly) {
      return { hidePostCloseForms: true };
    }

    if (
      closeBucket === CLOSED_CHAT_BUCKETS.COMPLETED ||
      closeBucket === CLOSED_CHAT_BUCKETS.SPAM
    ) {
      return { hidePostCloseForms: true };
    }

    const fromMessages = inboxTranscriptDisplayForClosed(messages);
    if (fromMessages) return fromMessages;
    if (requiresDistributionForm && distributionFormHref?.trim()) {
      return {
        requiresDistributionForm: true,
        distributionFormHref: distributionFormHref.trim(),
      };
    }
    return { hidePostCloseForms: true };
  }, [conversationMeta, messages, readOnly, requiresDistributionForm, distributionFormHref]);

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
            flexDirection: "column",
            gap: 1.25,
            py: 1.35,
            px: { xs: 1.5, sm: 2 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.25 },
              minWidth: 0,
              width: "100%",
            }}
          >
            {showBackButton && onDismissConversation ? (
              <IconButton
                size="small"
                aria-label="Back to conversations"
                onClick={onDismissConversation}
                sx={chatOpsBackButtonSx}
              >
                <ArrowBackOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            ) : null}
            <QueueAvatar sx={{ width: 42, height: 42, fontSize: 14, flexShrink: 0 }}>
              {visitorInfo.initials}
            </QueueAvatar>
            <Box sx={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 0.3 }}>
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
              {lastTransferFrom?.label ? (
                <Typography
                  sx={{
                    fontSize: 10,
                    lineHeight: 1.4,
                    fontWeight: 600,
                    color: theme.app.dashboard.accentOrange,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Transferred by {lastTransferFrom.label}
                </Typography>
              ) : null}
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                flexShrink: 0,
              }}
            >
              {!readOnly ? (
                <>
                  <TransferChatHeaderAction conversationId={conversationId} />
                  <GuestLinkHeaderAction
                    conversationId={conversationId}
                    hasOperational={hasOperational}
                    serviceChannel={serviceChannel}
                  />
                </>
              ) : null}
              {onMarkSpam ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="compact"
                    onClick={() => onMarkSpam()}
                    sx={{
                      display: { xs: "none", md: "inline-flex" },
                      minWidth: 0,
                      height: chatOpsConversationMetaChipHeight,
                      px: 1.5,
                      py: 0,
                      fontSize: 11,
                      color: theme.palette.warning.light,
                      borderColor: alpha(theme.palette.warning.main, 0.45),
                    }}
                  >
                    Mark spam
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
                        onMarkSpam();
                      }}
                      sx={{ color: theme.palette.warning.light }}
                    >
                      Mark as spam
                    </MenuItem>
                  </Menu>
                </>
              ) : null}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "wrap",
              pl: showBackButton && onDismissConversation ? { xs: 0, sm: 0.5 } : 0,
            }}
          >
            <ChatTranscriptStatusChip
              conversationMeta={conversationMeta}
              readOnly={readOnly}
              visitorTyping={visitorTyping}
            />
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
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

      {hasConversation &&
      readOnly &&
      requiresDistributionForm &&
      distributionFormHref?.trim() ? (
        <Box sx={{ flexShrink: 0, px: 2, pt: 1.25 }}>
          <ChatDistributionLinkBanner
            href={distributionFormHref.trim()}
            submitted={distributionSubmitted}
            hint="Chat closed. Open the distribution form to send the transcript to a department."
            buttonLabel="Open distribution form"
            submittedHint="Distribution form already submitted for this chat."
          />
        </Box>
      ) : null}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          bgcolor: (t) => alpha((t as AppTheme).app.dashboard.overlayLight, 0.2),
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

      {!readOnly ? (
        <ChatContextRail
          hasConversation={hasConversation}
          readOnly={readOnly}
          availabilityHint={availabilityHint}
        />
      ) : null}

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
