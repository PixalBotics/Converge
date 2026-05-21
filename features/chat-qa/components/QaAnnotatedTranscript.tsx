"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { ChatMessageBubble, ChatDateDivider, groupMessagesByDate } from "@/features/chat-operations/components/ChatMessageBubble";
import { getMessageGroupPosition } from "@/features/chat-operations/utils/message-grouping";
import { parseVisitorInfo } from "@/features/chat-operations/utils/visitor-info";
import {
  EmptyState,
  MessageThread,
  PanelColumn,
  PanelHeader,
  QueueAvatar,
} from "@/features/chat-operations/styles/chat-operations.styled";
import { extractVisitorPresentation } from "@/services/chat/visitor-presentation";
import type { ChatMessage } from "@/services/chat/chat.types";
import type {
  MessageQaAnnotation,
  QaReviewBundle,
  UpsertQaMessageAnnotationBody,
} from "@/services/chat/qa.types";
import { agentDisplayName } from "@/services/chat/monitor-normalizers";
import { chatQaReviewBannerSx } from "../styles/chat-qa.styles";
import { QaMessageAnnotationDialog } from "./QaMessageAnnotationDialog";

interface QaAnnotatedTranscriptProps {
  bundle: QaReviewBundle | null;
  messages: ChatMessage[];
  visitor: Record<string, unknown> | null;
  loading: boolean;
  canAnnotate: boolean;
  annotationsByMessageId: Map<string, MessageQaAnnotation>;
  onSaveAnnotation: (messageId: string, body: UpsertQaMessageAnnotationBody) => Promise<void>;
  saving?: boolean;
}

export function QaAnnotatedTranscript({
  bundle,
  messages,
  visitor,
  loading,
  canAnnotate,
  annotationsByMessageId,
  onSaveAnnotation,
  saving = false,
}: QaAnnotatedTranscriptProps) {
  const theme = useTheme() as AppTheme;
  const [annotateMessageId, setAnnotateMessageId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const vp = bundle?.transcript
    ? extractVisitorPresentation(bundle.transcript as Record<string, unknown>)
    : null;
  const visitorInfo = parseVisitorInfo(visitor, bundle?.transcript as Record<string, unknown>);
  const title = vp?.inboxTitle || vp?.displayName || visitorInfo.displayName;
  const agent =
    bundle?.transcript && typeof bundle.transcript === "object"
      ? (bundle.transcript as { agent?: unknown }).agent
      : null;

  const selectedMessage = messages.find((m) => m.id === annotateMessageId);
  const selectedAnnotation = annotateMessageId
    ? annotationsByMessageId.get(annotateMessageId) ?? null
    : null;

  const hasConversation = Boolean(bundle);
  const groups = groupMessagesByDate(messages);

  return (
    <PanelColumn sx={{ height: "100%", overflow: "hidden" }}>
      <Box sx={chatQaReviewBannerSx}>
        <Typography variant="caption" sx={{ fontSize: 11, color: theme.app.dashboard.textMuted }}>
          {canAnnotate
            ? "Click a message to add or edit QA annotations."
            : "Read-only transcript."}
        </Typography>
      </Box>

      {hasConversation ? (
        <PanelHeader sx={{ py: 1.5, display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
          <QueueAvatar sx={{ width: 44, height: 44 }}>{visitorInfo.initials}</QueueAvatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography fontWeight={700} sx={{ fontSize: 15 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Agent: {agentDisplayName(agent as Parameters<typeof agentDisplayName>[0])}
            </Typography>
          </Box>
        </PanelHeader>
      ) : null}

      {loading ? (
        <Box sx={{ p: 3 }}>
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading review…</Typography>
        </Box>
      ) : !hasConversation ? (
        <EmptyState sx={{ flex: 1, py: 8 }}>
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>
            Select a review from the queue
          </Typography>
        </EmptyState>
      ) : (
        <MessageThread sx={{ flex: 1, px: { xs: 2, md: 3 }, py: 2.5, gap: 1.25 }}>
          {groups.map((group) => (
            <div key={group.dateKey}>
              <ChatDateDivider label={group.label} />
              {group.messages.map((message, idx) => {
                const msgId = message.id;
                const ann = msgId ? annotationsByMessageId.get(msgId) : undefined;
                const clickable = canAnnotate && msgId && message.role !== "system";
                const inner = (
                  <ChatMessageBubble
                    message={message}
                    visitorInitials={visitorInfo.initials}
                    visitorDisplayName={title}
                    agentDisplayName={agentDisplayName(
                      agent as Parameters<typeof agentDisplayName>[0],
                    )}
                    groupPosition={getMessageGroupPosition(idx, group.messages)}
                  />
                );
                if (!clickable) return <Box key={msgId ?? `${group.dateKey}-${idx}`}>{inner}</Box>;
                return (
                  <Box
                    key={msgId}
                    role="button"
                    tabIndex={0}
                    onClick={() => setAnnotateMessageId(msgId!)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setAnnotateMessageId(msgId!);
                    }}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 1,
                      outline: ann
                        ? `1px dashed ${alpha(theme.app.dashboard.accentViolet, 0.45)}`
                        : "transparent",
                      "&:hover": { bgcolor: alpha(theme.app.dashboard.accentViolet, 0.06) },
                      position: "relative",
                    }}
                  >
                    {ann ? (
                      <Chip
                        label={
                          ann.rating != null
                            ? `★ ${ann.rating}${ann.tags?.length ? ` · ${ann.tags[0]}` : ""}`
                            : "Note"
                        }
                        size="small"
                        sx={{
                          position: "absolute",
                          right: 12,
                          top: 4,
                          height: 18,
                          fontSize: 9,
                          zIndex: 1,
                        }}
                      />
                    ) : null}
                    {inner}
                  </Box>
                );
              })}
            </div>
          ))}
          <div ref={endRef} />
        </MessageThread>
      )}

      <QaMessageAnnotationDialog
        open={Boolean(annotateMessageId && selectedMessage)}
        messagePreview={selectedMessage?.content ?? ""}
        existing={selectedAnnotation}
        onClose={() => setAnnotateMessageId(null)}
        onSave={async (body) => {
          if (!annotateMessageId) return;
          await onSaveAnnotation(annotateMessageId, body);
        }}
        saving={saving}
      />
    </PanelColumn>
  );
}
