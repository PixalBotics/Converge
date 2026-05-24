"use client";

import DoneAll from "@mui/icons-material/DoneAll";
import type { ChatMessage } from "@/services/chat/chat.types";
import { Typography } from "@/components/common";
import { ChatMessageContent } from "./ChatMessageContent";
import { formatMessageTime } from "../utils/format-message-time";
import type { MessageGroupPosition } from "../utils/message-grouping";
import {
  shouldShowMessageAvatar,
  shouldShowMessageMeta,
} from "../utils/message-grouping";
import {
  DateDivider,
  DateDividerLabel,
  MessageAvatar,
  MessageAvatarSpacer,
  MessageBubble,
  MessageMeta,
  MessageRow,
  MessageRowOuter,
} from "../styles/chat-operations.styled";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  visitorInitials?: string;
  visitorDisplayName?: string;
  agentDisplayName?: string;
  groupPosition?: MessageGroupPosition;
}

export function ChatMessageBubble({
  message,
  visitorInitials = "V",
  visitorDisplayName = "Visitor",
  agentDisplayName = "You",
  groupPosition = "single",
}: ChatMessageBubbleProps) {
  const isSystem = message.role === "system";
  const isOutgoing = message.role === "agent";
  const showAvatar = shouldShowMessageAvatar(message, groupPosition);
  const showMeta = shouldShowMessageMeta(groupPosition);
  const senderLabel = isOutgoing ? agentDisplayName : visitorDisplayName;

  if (isSystem) {
    return (
      <MessageRowOuter system>
        <MessageRow system>
          <MessageBubble outgoing={false} system groupPosition="single">
            <ChatMessageContent message={message} />
          </MessageBubble>
        </MessageRow>
      </MessageRowOuter>
    );
  }

  return (
    <MessageRowOuter outgoing={isOutgoing}>
      {!isOutgoing && showAvatar ? (
        <MessageAvatar aria-hidden>{visitorInitials}</MessageAvatar>
      ) : !isOutgoing ? (
        <MessageAvatarSpacer aria-hidden />
      ) : null}

      <MessageRow outgoing={isOutgoing}>
        <MessageBubble outgoing={isOutgoing} groupPosition={groupPosition}>
          <ChatMessageContent message={message} />
        </MessageBubble>
        {showMeta ? (
          <MessageMeta
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              justifyContent: isOutgoing ? "flex-end" : "flex-start",
              px: 0.5,
            }}
          >
            {senderLabel}
            {message.createdAt ? ` · ${formatMessageTime(message.createdAt)}` : ""}
            {isOutgoing ? <DoneAll sx={{ fontSize: 14, opacity: 0.85 }} /> : null}
          </MessageMeta>
        ) : null}
      </MessageRow>
    </MessageRowOuter>
  );
}

export function ChatDateDivider({ label }: { label: string }) {
  return (
    <DateDivider>
      <DateDividerLabel>{label}</DateDividerLabel>
    </DateDivider>
  );
}

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Earlier";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function groupMessagesByDate(messages: ChatMessage[]): Array<{
  dateKey: string;
  label: string;
  messages: ChatMessage[];
}> {
  const sorted = [...messages].sort((a, b) =>
    String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")),
  );

  const groups: Array<{ dateKey: string; label: string; messages: ChatMessage[] }> = [];

  for (const message of sorted) {
    const dateKey = message.createdAt ? new Date(message.createdAt).toDateString() : "unknown";
    const existing = groups.find((g) => g.dateKey === dateKey);
    if (existing) {
      existing.messages.push(message);
    } else {
      groups.push({
        dateKey,
        label: message.createdAt ? formatDateLabel(message.createdAt) : "Earlier",
        messages: [message],
      });
    }
  }

  return groups;
}
