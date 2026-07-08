"use client";

import { useEffect, useRef } from "react";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import { agentAiActionNeedsWebsite } from "@/lib/ai/agent-copilot-input";
import type { AiChatMessage } from "../types/ai-chat";
import {
  AiAssistantShell,
  AiChatBubble,
  AiChatThread,
  AiInputFooter,
  AiInputRow,
  AiQuickChip,
  AiSendButton,
  ComposerTextField,
} from "../styles/chat-operations.styled";
import SendRounded from "@mui/icons-material/SendRounded";
import {
  AGENT_COPILOT_EMPTY_HINT,
  AGENT_COPILOT_SUBTITLE,
  AGENT_COPILOT_WEBSITE_REQUIRED,
} from "@/lib/ai/ai-role-copy";

const QUICK_ACTIONS: Array<{ action: AgentAiAction; label: string }> = [
  { action: "knowledge_lookup", label: "KB lookup" },
  { action: "suggested_reply", label: "Suggest reply" },
  { action: "coach_reply", label: "Coach me" },
  { action: "summarize", label: "Summarize" },
  { action: "rewrite_tone", label: "Rewrite" },
];

const STARTER_PROMPTS = [
  "What does our KB say about this topic?",
  "How should I answer the visitor's last message?",
  "What policy applies here?",
];

const ACTION_LABELS: Partial<Record<AgentAiAction, string>> = {
  suggested_reply: "Suggest reply",
  summarize: "Summarize",
  rewrite_tone: "Rewrite",
  knowledge_lookup: "KB lookup",
  coach_reply: "Ask AI",
};

interface AiAssistantDrawerProps {
  messages: AiChatMessage[];
  prompt: string;
  onPromptChange: (value: string) => void;
  onSendPrompt: (prompt: string, action?: AgentAiAction) => void;
  onApplyToComposer?: (text: string) => void;
  busy: boolean;
  disabled?: boolean;
  websiteRequiredDisabled?: boolean;
  hasConversation: boolean;
  /** When true, header in parent already shows subtitle — hide duplicate. */
  embedded?: boolean;
}

export function AiAssistantDrawer({
  messages,
  prompt,
  onPromptChange,
  onSendPrompt,
  onApplyToComposer,
  busy,
  disabled = false,
  websiteRequiredDisabled = false,
  hasConversation,
  embedded = false,
}: AiAssistantDrawerProps) {
  const theme = useTheme() as AppTheme;
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  if (!hasConversation) {
    return (
      <Typography
        variant="caption"
        sx={{ color: theme.app.dashboard.textMuted, px: 2, py: 2, display: "block" }}
      >
        Select a conversation to open Agent Copilot.
      </Typography>
    );
  }

  const sendFreeText = (text: string, action: AgentAiAction = "knowledge_lookup") => {
    const trimmed = text.trim();
    if (!trimmed || disabled || busy || websiteRequiredDisabled) return;
    onSendPrompt(trimmed, action);
  };

  return (
    <AiAssistantShell>
      {!embedded ? (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            px: 2,
            pt: 1.25,
            pb: 0.5,
            color: theme.app.dashboard.textMuted,
            lineHeight: 1.45,
            fontSize: 11,
          }}
        >
          {AGENT_COPILOT_SUBTITLE}
        </Typography>
      ) : null}
      {websiteRequiredDisabled ? (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            px: 2,
            pb: 0.75,
            color: theme.palette.warning.main,
            fontSize: 11,
          }}
        >
          {AGENT_COPILOT_WEBSITE_REQUIRED}
        </Typography>
      ) : null}
      <AiChatThread ref={threadRef} sx={{ pt: embedded ? 1 : 0.5 }}>
        {messages.length === 0 ? (
          <Box sx={{ py: 1, px: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: theme.app.dashboard.textMuted,
                textAlign: "center",
                display: "block",
                mb: 1.25,
                lineHeight: 1.5,
              }}
            >
              {AGENT_COPILOT_EMPTY_HINT}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.75, fontSize: 11 }}
            >
              Try asking:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {STARTER_PROMPTS.map((example) => (
                <AiQuickChip
                  key={example}
                  type="button"
                  disabled={disabled || busy || websiteRequiredDisabled}
                  onClick={() => sendFreeText(example, "knowledge_lookup")}
                  style={{ textAlign: "left", whiteSpace: "normal", borderRadius: 10 }}
                >
                  {example}
                </AiQuickChip>
              ))}
            </Box>
          </Box>
        ) : (
          messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                width: "100%",
                gap: 0.5,
              }}
            >
              {msg.role === "user" && msg.action ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 10,
                    color: theme.app.dashboard.textMuted,
                    pr: 0.5,
                  }}
                >
                  {ACTION_LABELS[msg.action] ?? msg.action}
                </Typography>
              ) : null}
              <AiChatBubble role={msg.role}>
                {msg.pending ? (
                  <CircularProgress size={14} sx={{ color: theme.app.dashboard.textMuted }} />
                ) : (
                  msg.content
                )}
              </AiChatBubble>
              {msg.role === "assistant" && !msg.pending && msg.sources && msg.sources.length > 0 ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 10,
                    color: theme.app.dashboard.textMuted,
                    lineHeight: 1.4,
                    px: 0.25,
                  }}
                >
                  Source: {msg.sources[0]}
                </Typography>
              ) : null}
              {msg.role === "assistant" && !msg.pending && onApplyToComposer ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="compact"
                  onClick={() => onApplyToComposer(msg.content)}
                  sx={{
                    minWidth: 0,
                    px: 1.25,
                    py: 0.35,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Insert into reply
                </Button>
              ) : null}
            </Box>
          ))
        )}
      </AiChatThread>

      <AiInputFooter>
        <AiInputRow sx={{ mb: 1 }}>
          <ComposerTextField
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            placeholder="Ask the AI Assistant (same KB as visitor)…"
            value={prompt}
            disabled={disabled || busy || websiteRequiredDisabled}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" && !ev.shiftKey) {
                ev.preventDefault();
                sendFreeText(prompt, "knowledge_lookup");
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: 40,
                alignItems: "flex-start",
                pt: 0.5,
              },
            }}
          />
          <AiSendButton
            aria-label="Send to AI Assistant"
            disabled={!prompt.trim() || disabled || busy || websiteRequiredDisabled}
            onClick={() => sendFreeText(prompt, "knowledge_lookup")}
            sx={{ width: 44, height: 44 }}
          >
            {busy ? (
              <CircularProgress size={20} sx={{ color: "inherit" }} />
            ) : (
              <SendRounded sx={{ fontSize: 20 }} />
            )}
          </AiSendButton>
        </AiInputRow>
        <Link
          component={NextLink}
          href="/dashboard/ai-training/assistant"
          underline="hover"
          sx={{
            display: "block",
            mb: 0.75,
            fontSize: 11,
            fontWeight: 600,
            color: theme.app.dashboard.textMuted,
            "&:hover": { color: theme.app.text.primary },
          }}
        >
          Manage AI Assistant training for this website →
        </Link>
        <Typography
          variant="caption"
          sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1, fontSize: 11 }}
        >
          Quick actions:
        </Typography>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {QUICK_ACTIONS.map(({ action, label }) => {
            const actionDisabled =
              disabled ||
              busy ||
              (agentAiActionNeedsWebsite(action) && websiteRequiredDisabled);
            return (
              <AiQuickChip
                key={action}
                type="button"
                disabled={actionDisabled}
                onClick={() => {
                  if (prompt.trim()) {
                    onSendPrompt(prompt.trim(), action);
                  } else {
                    onSendPrompt(`Run ${label.toLowerCase()} for this conversation`, action);
                  }
                }}
              >
                {label}
              </AiQuickChip>
            );
          })}
        </div>
      </AiInputFooter>
    </AiAssistantShell>
  );
}
