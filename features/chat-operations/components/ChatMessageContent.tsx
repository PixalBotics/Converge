"use client";

import Link from "@mui/material/Link";
import { Typography } from "@/components/common";
import type { ChatMessage } from "@/services/chat/chat.types";

function readHref(message: ChatMessage): string | null {
  const meta = message.metadata;
  if (!meta) return null;
  const href = meta.href;
  if (typeof href === "string" && href.trim()) return href.trim();
  const attachment = meta.attachmentMetadata;
  if (attachment && typeof attachment === "object") {
    const nested = (attachment as Record<string, unknown>).href;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
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

/** Renders chat message body with clickable links for form / distribution messages. */
export function ChatMessageContent({ message }: { message: ChatMessage }) {
  const messageType = readMessageType(message);
  const href = readHref(message);
  const linkLabel = readLinkLabel(message);

  if (
    href &&
    (messageType === "distribution_link" ||
      message.content.includes(href))
  ) {
    const lines = message.content.split("\n");
    const intro = lines.filter((line) => line.trim() && line.trim() !== href && line.trim() !== linkLabel);
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
        {linkLabel ? (
          <Typography
            component="span"
            sx={{
              display: "block",
              fontWeight: 600,
              color: "inherit",
              fontSize: "inherit",
              mb: 0.5,
            }}
          >
            {linkLabel}
          </Typography>
        ) : null}
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "inherit",
            fontWeight: 600,
            textDecoration: "underline",
            wordBreak: "break-all",
          }}
        >
          {href}
        </Link>
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
