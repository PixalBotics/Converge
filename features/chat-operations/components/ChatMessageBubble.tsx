"use client";

import DoneAll from "@mui/icons-material/DoneAll";
import type { ChatMessage } from "@/services/chat/chat.types";
import { Typography } from "@/components/common";
import { ChatMessageContent } from "./ChatMessageContent";
import { isInboxFormLinkMessage } from "../utils/inbox-transcript-messages";
import Box from "@mui/material/Box";
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
  const isAi = message.role === "ai";
  const isAgent = message.role === "agent";
  const isOutgoing = isAgent || isAi;
  const showAvatar = shouldShowMessageAvatar(message, groupPosition);
  const showMeta = shouldShowMessageMeta(groupPosition);
  const senderLabel = isAi
    ? "AI"
    : isOutgoing
      ? agentDisplayName
      : visitorDisplayName;

  if (isSystem && isInboxFormLinkMessage(message)) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 560,
          alignSelf: "center",
          my: 0.75,
          px: { xs: 0.5, md: 0 },
        }}
      >
        <ChatMessageContent message={message} />
      </Box>
    );
  }

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
        <MessageBubble
          outgoing={isOutgoing}
          ai={isAi}
          groupPosition={groupPosition}
        >
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
            {isAgent ? <DoneAll sx={{ fontSize: 14, opacity: 0.85 }} /> : null}
          </MessageMeta>
        ) : null}
      </MessageRow>

      {isOutgoing && showAvatar ? (
        <MessageAvatar ai={isAi} aria-hidden>
          {isAi ? "AI" : agentDisplayName.charAt(0).toUpperCase() || "A"}
        </MessageAvatar>
      ) : isOutgoing ? (
        <MessageAvatarSpacer aria-hidden />
      ) : null}
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

  if (isToday) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function groupMessagesByDate(messages: import("@/services/chat/chat.types").ChatMessage[]) {
  const groups: Array<{ dateKey: string; label: string; messages: typeof messages }> = [];
  for (const message of messages) {
    const key = message.createdAt?.slice(0, 10) ?? "unknown";
    const label = message.createdAt ? formatDateLabel(message.createdAt) : "Earlier";
    const last = groups[groups.length - 1];
    if (last?.dateKey === key) {
      last.messages.push(message);
    } else {
      groups.push({ dateKey: key, label, messages: [message] });
    }
  }
  return groups;
}
