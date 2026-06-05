"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import InboxOutlined from "@mui/icons-material/InboxOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { TypingPreviewBubble } from "@/lib/hooks/chat/typing-preview-display";
import type { ChatMessage } from "@/services/chat/chat.types";
import { getMessageGroupPosition } from "../utils/message-grouping";
import {
  prepareInboxTranscriptMessages,
  type InboxTranscriptDisplayOptions,
} from "../utils/inbox-transcript-messages";
import {
  ChatDateDivider,
  ChatMessageBubble,
  groupMessagesByDate,
} from "./ChatMessageBubble";
import {
  EmptyState,
  EmptyStateIconRing,
  MessageThread,
  TypingDots,
  TypingIndicator,
} from "../styles/chat-operations.styled";

interface ChatMessageListProps {
  messages: ChatMessage[];
  conversationId?: string | null;
  visitorInitials?: string;
  visitorTyping?: boolean;
  visitorTypingDraft?: string;
  /** Live typing from any participant (visitor, agent, supervisor). */
  typingPreviews?: TypingPreviewBubble[];
  visitorDisplayName?: string;
  agentDisplayName?: string;
  /** Full-pane empty when no conversation is selected. */
  showEmptyPlaceholder?: boolean;
  transcriptDisplay?: InboxTranscriptDisplayOptions;
}

export function ChatMessageList({
  messages,
  conversationId = null,
  visitorInitials = "V",
  visitorTyping = false,
  visitorTypingDraft = "",
  typingPreviews,
  visitorDisplayName = "Visitor",
  agentDisplayName = "You",
  showEmptyPlaceholder = false,
  transcriptDisplay,
}: ChatMessageListProps) {
  const theme = useTheme() as AppTheme;
  const threadRef = useRef<HTMLDivElement | null>(null);
  const displayMessages = useMemo(
    () => prepareInboxTranscriptMessages(messages, transcriptDisplay),
    [messages, transcriptDisplay],
  );
  const groups = groupMessagesByDate(displayMessages);

  const lastMessageKey =
    displayMessages.length > 0
      ? displayMessages[displayMessages.length - 1]?.id ??
        `${displayMessages[displayMessages.length - 1]?.createdAt}-${displayMessages[displayMessages.length - 1]?.content}`
      : "";

  const scrollThreadToBottom = useCallback((instant = true) => {
    const el = threadRef.current;
    if (!el) return;
    if (instant) {
      el.scrollTop = el.scrollHeight;
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useLayoutEffect(() => {
    scrollThreadToBottom(true);
  }, [conversationId, scrollThreadToBottom]);

  useLayoutEffect(() => {
    scrollThreadToBottom(true);
  }, [displayMessages.length, lastMessageKey, visitorTyping, typingPreviews?.length, scrollThreadToBottom]);

  const activeTypingPreviews =
    typingPreviews && typingPreviews.length > 0
      ? typingPreviews
      : visitorTyping
        ? [
            {
              id: "visitor-legacy",
              role: "visitor" as const,
              label: visitorDisplayName,
              draft: visitorTypingDraft.trim(),
              kind: "visitor" as const,
            },
          ].filter((row) => row.draft.length > 0 || visitorTyping)
        : [];

  const showAnyTyping = activeTypingPreviews.length > 0;

  if (displayMessages.length === 0 && !showAnyTyping) {
    return (
      <MessageThread ref={threadRef} sx={{ flex: "1 1 0", minHeight: 0 }}>
        <EmptyState>
          <EmptyStateIconRing>
            {showEmptyPlaceholder ? (
              <InboxOutlined sx={{ fontSize: 32 }} />
            ) : (
              <ForumOutlined sx={{ fontSize: 32 }} />
            )}
          </EmptyStateIconRing>
          <Typography variant="mediumLarge" fontWeight={600} sx={{ color: theme.app.text.primary }}>
            {showEmptyPlaceholder ? "Pick a conversation" : "No messages yet"}
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 300 }}>
            {showEmptyPlaceholder
              ? "Choose a visitor from the inbox to read their messages and reply."
              : "Send a reply below when you're ready to help."}
          </Typography>
        </EmptyState>
      </MessageThread>
    );
  }

  return (
    <MessageThread
      ref={threadRef}
      sx={{
        flex: "1 1 0",
        minHeight: 0,
        px: { xs: 2, md: 3 },
        py: 2.5,
        gap: 1.25,
      }}
    >
      {groups.map((group) => (
        <div key={group.dateKey}>
          <ChatDateDivider label={group.label} />
          {group.messages.map((message, idx) => (
            <ChatMessageBubble
              key={message.id ?? `${group.dateKey}-${idx}-${message.createdAt}`}
              message={message}
              visitorInitials={visitorInitials}
              visitorDisplayName={visitorDisplayName}
              agentDisplayName={agentDisplayName}
              groupPosition={getMessageGroupPosition(idx, group.messages)}
            />
          ))}
        </div>
      ))}

      {activeTypingPreviews.map((preview) => {
        const hasDraft = preview.draft.length > 0;
        if (hasDraft) {
          return (
            <ChatMessageBubble
              key={preview.id}
              message={{
                id: preview.id,
                conversationId: conversationId ?? "",
                content: preview.draft,
                role: preview.role,
                metadata: { typingPreview: true },
              }}
              visitorInitials={visitorInitials}
              visitorDisplayName={preview.label}
              agentDisplayName={preview.label}
              groupPosition="single"
            />
          );
        }
        return (
          <TypingIndicator key={preview.id}>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {preview.label} is typing
            </Typography>
            <TypingDots aria-hidden>
              <span />
              <span />
              <span />
            </TypingDots>
          </TypingIndicator>
        );
      })}
    </MessageThread>
  );
}
