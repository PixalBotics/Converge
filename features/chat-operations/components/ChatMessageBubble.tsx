"use client";

import { useCallback, useRef } from "react";
import DoneAll from "@mui/icons-material/DoneAll";
import type { ChatMessage } from "@/services/chat/chat.types";
import type { VisitorProfileCaptureAnchor } from "../utils/visitor-profile-capture";
import { readVisitorTextSelection } from "../utils/visitor-profile-capture";
import { Typography } from "@/components/common";
import { ChatMessageContent } from "./ChatMessageContent";
import { isInboxFormLinkMessage } from "../utils/inbox-transcript-messages";
import {
  isSupervisorSentMessage,
  resolveMessageSenderLabel,
} from "../utils/message-sender-label";
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
  profileCaptureEnabled?: boolean;
  onProfileCaptureSelection?: (anchor: VisitorProfileCaptureAnchor) => void;
}

export function ChatMessageBubble({
  message,
  visitorInitials = "V",
  visitorDisplayName = "Visitor",
  agentDisplayName = "You",
  groupPosition = "single",
  profileCaptureEnabled = false,
  onProfileCaptureSelection,
}: ChatMessageBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const isSystem = message.role === "system";
  const isAi = message.role === "ai";
  const isAgent = message.role === "agent";
  const isVisitor = message.role === "visitor";
  const isFormLink = isInboxFormLinkMessage(message);
  const isSupervisor = isSupervisorSentMessage(message);
  const isOutgoing = (isAgent || isAi) && !isFormLink;
  const showAvatar = shouldShowMessageAvatar(message, groupPosition);
  const showMeta = shouldShowMessageMeta(groupPosition);
  const senderLabel = resolveMessageSenderLabel(message, {
    visitorDisplayName,
    agentDisplayName,
  });
  const rowSpacingSx =
    groupPosition === "middle" || groupPosition === "first"
      ? { mb: 0.25 }
      : { mb: 1.25 };

  const handleVisitorMouseUp = useCallback(() => {
    if (!profileCaptureEnabled || !isVisitor || !onProfileCaptureSelection) return;
    const container = bubbleRef.current;
    if (!container) return;
    const anchor = readVisitorTextSelection(container, message.id);
    if (anchor) onProfileCaptureSelection(anchor);
  }, [
    isVisitor,
    message.id,
    onProfileCaptureSelection,
    profileCaptureEnabled,
  ]);

  if (isFormLink || (isSystem && isInboxFormLinkMessage(message))) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          alignSelf: "stretch",
          my: 0.75,
        }}
      >
        <ChatMessageContent message={message} />
      </Box>
    );
  }

  if (isSystem) {
    return (
      <MessageRowOuter system sx={rowSpacingSx}>
        <MessageRow system>
          <MessageBubble outgoing={false} system groupPosition="single">
            <ChatMessageContent message={message} />
          </MessageBubble>
        </MessageRow>
      </MessageRowOuter>
    );
  }

  return (
    <MessageRowOuter
      outgoing={isOutgoing}
      sx={rowSpacingSx}
      {...(message.id
        ? {
            "data-chat-message-id": message.id,
            "data-chat-message-role": message.role,
          }
        : {})}
    >
      {!isOutgoing && showAvatar ? (
        <MessageAvatar aria-hidden>{visitorInitials}</MessageAvatar>
      ) : !isOutgoing ? (
        <MessageAvatarSpacer aria-hidden />
      ) : null}

      <MessageRow outgoing={isOutgoing}>
        <MessageBubble
          ref={isVisitor && profileCaptureEnabled ? bubbleRef : undefined}
          outgoing={isOutgoing}
          ai={isAi}
          groupPosition={groupPosition}
          onMouseUp={isVisitor && profileCaptureEnabled ? handleVisitorMouseUp : undefined}
          sx={
            isVisitor && profileCaptureEnabled
              ? { userSelect: "text", cursor: "text" }
              : undefined
          }
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
              alignSelf: isOutgoing ? "stretch" : undefined,
              width: isOutgoing ? "100%" : undefined,
              textAlign: isOutgoing ? "right" : "left",
              px: isOutgoing ? 0 : 0.5,
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
          {isAi ? "AI" : isSupervisor ? "S" : agentDisplayName.charAt(0).toUpperCase() || "A"}
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
