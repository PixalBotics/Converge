"use client";

import { useEffect, useRef } from "react";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import InboxOutlined from "@mui/icons-material/InboxOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { ChatMessage } from "@/services/chat/chat.types";
import { getMessageGroupPosition } from "../utils/message-grouping";
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
  visitorInitials?: string;
  visitorTyping?: boolean;
  visitorDisplayName?: string;
  agentDisplayName?: string;
  /** Full-pane empty when no conversation is selected. */
  showEmptyPlaceholder?: boolean;
}

export function ChatMessageList({
  messages,
  visitorInitials = "V",
  visitorTyping = false,
  visitorDisplayName = "Visitor",
  agentDisplayName = "You",
  showEmptyPlaceholder = false,
}: ChatMessageListProps) {
  const theme = useTheme() as AppTheme;
  const endRef = useRef<HTMLDivElement | null>(null);
  const groups = groupMessagesByDate(messages);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, visitorTyping]);

  if (messages.length === 0 && !visitorTyping) {
    return (
      <MessageThread>
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
    <MessageThread sx={{ px: { xs: 2, md: 3 }, py: 2.5, gap: 1.25 }}>
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

      <div ref={endRef} />
    </MessageThread>
  );
}
