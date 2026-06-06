"use client";

import Box from "@mui/material/Box";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeChatMessageText } from "./text";
import { chatFormattedMessageSx } from "./chat-formatted-message.styles";

const markdownComponents: Components = {
  a: ({ href, children }) => {
    const url = typeof href === "string" ? href.trim() : "";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return <span>{children}</span>;
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  img: () => null,
  h1: ({ children }) => <p><strong>{children}</strong></p>,
  h2: ({ children }) => <p><strong>{children}</strong></p>,
  h3: ({ children }) => <p><strong>{children}</strong></p>,
  h4: ({ children }) => <p><strong>{children}</strong></p>,
  h5: ({ children }) => <p><strong>{children}</strong></p>,
  h6: ({ children }) => <p><strong>{children}</strong></p>,
  pre: ({ children }) => <Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap", fontSize: "0.92em" }}>{children}</Box>,
};

export function ChatFormattedMessage({
  text,
  linkColor,
  className,
}: {
  text: string;
  linkColor?: string;
  className?: string;
}) {
  const normalized = normalizeChatMessageText(text);
  if (!normalized) return null;

  return (
    <Box
      className={className}
      sx={chatFormattedMessageSx(linkColor)}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {normalized}
      </ReactMarkdown>
    </Box>
  );
}
