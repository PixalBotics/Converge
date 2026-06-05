"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import InboxOutlined from "@mui/icons-material/InboxOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
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
import { chatOpsTranscriptInsetSx } from "../styles/chat-operations.styles";
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
  }, [displayMessages.length, lastMessageKey, visitorTyping, scrollThreadToBottom]);

  if (displayMessages.length === 0 && !visitorTyping) {
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
        ...chatOpsTranscriptInsetSx,
        py: 2.5,
        gap: 0,
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

      {visitorTyping ? (
        <TypingIndicator>
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {visitorDisplayName} is typing
          </Typography>
          <TypingDots aria-hidden>
            <span />
            <span />
            <span />
          </TypingDots>
        </TypingIndicator>
      ) : null}
    </MessageThread>
  );
}
