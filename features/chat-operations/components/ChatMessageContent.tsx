"use client";

import { Typography } from "@/components/common";
import type { ChatMessage } from "@/services/chat/chat.types";
import { ChatMessageAttachmentCard } from "./ChatMessageAttachmentCard";
import { resolveDashboardHref } from "../utils/resolve-dashboard-href";

function readHref(message: ChatMessage): string | null {
  const meta = message.metadata;
  if (!meta) return null;
  const attachment = meta.attachmentMetadata;
  if (attachment && typeof attachment === "object") {
    const path = (attachment as Record<string, unknown>).path;
    if (typeof path === "string" && path.trim()) {
      return resolveDashboardHref(path.trim());
    }
  }
  const href = meta.href;
  if (typeof href === "string" && href.trim()) {
    return resolveDashboardHref(href.trim());
  }
  if (attachment && typeof attachment === "object") {
    const nested = (attachment as Record<string, unknown>).href;
    if (typeof nested === "string" && nested.trim()) {
      return resolveDashboardHref(nested.trim());
    }
  }
  return null;
}

function readMessageType(message: ChatMessage): string | null {
  const meta = message.metadata;
  if (!meta) return null;
  const mt = meta.messageType;
  return typeof mt === "string" ? mt : null;
}

function readLinkLabel(message: ChatMessage): string | null {
  const meta = message.metadata;
  if (!meta) return null;
  const label = meta.label;
  if (typeof label === "string" && label.trim()) return label.trim();
  const attachment = meta.attachmentMetadata;
  if (attachment && typeof attachment === "object") {
    const nested = (attachment as Record<string, unknown>).label;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
  }
  return null;
}

function readFormKind(message: ChatMessage): string | undefined {
  const meta = message.metadata;
  if (!meta) return undefined;
  const attachment = meta.attachmentMetadata;
  if (attachment && typeof attachment === "object") {
    const kind = (attachment as Record<string, unknown>).formKind;
    if (typeof kind === "string") return kind;
  }
  return undefined;
}

function attachmentTitle(message: ChatMessage, messageType: string | null): string {
  const label = readLinkLabel(message);
  if (label) return label;
  if (messageType === "distribution_link") return "Open distribution form";
  if (messageType === "close_form_link") return "Open wrap-up form";
  return "Open form";
}

function introLines(message: ChatMessage, href: string, linkLabel: string | null): string[] {
  return message.content
    .split("\n")
    .filter(
      (line) =>
        line.trim() &&
        line.trim() !== href &&
        line.trim() !== linkLabel &&
        !line.trim().startsWith("http"),
    );
}

/** Renders chat message body with form attachment cards for distribution / wrap-up links. */
export function ChatMessageContent({ message }: { message: ChatMessage }) {
  const messageType = readMessageType(message);
  const href = readHref(message);
  const linkLabel = readLinkLabel(message);

  const isFormAttachment =
    href &&
    (messageType === "distribution_link" ||
      messageType === "close_form_link" ||
      message.content.includes(href));

  if (isFormAttachment && href) {
    const intro = introLines(message, href, linkLabel);
    const formKind =
      readFormKind(message) ??
      (messageType === "distribution_link" ? "distribution" : messageType === "close_form_link" ? "close" : undefined);

    return (
      <>
        {intro.map((line, i) => (
          <Typography
            key={`${line}-${i}`}
            component="span"
            sx={{
              display: "block",
              color: "inherit",
              fontSize: "inherit",
              lineHeight: "inherit",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              mb: line ? 0.5 : 0,
            }}
          >
            {line}
          </Typography>
        ))}
        <ChatMessageAttachmentCard
          href={href}
          title={attachmentTitle(message, messageType)}
          subtitle={
            formKind === "distribution"
              ? "Send the transcript to the selected department."
              : formKind === "close"
                ? "Complete the post-close wrap-up form for this conversation."
                : undefined
          }
          formKind={formKind}
        />
      </>
    );
  }

  return (
    <Typography
      component="span"
      sx={{
        color: "inherit",
        fontSize: "inherit",
        lineHeight: "inherit",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {message.content}
    </Typography>
  );
}
