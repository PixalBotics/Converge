"use client";

import { useEffect, useRef } from "react";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
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
  { action: "suggested_reply", label: "Suggest reply" },
  { action: "summarize", label: "Summarize" },
  { action: "rewrite_tone", label: "Rewrite" },
  { action: "knowledge_lookup", label: "KB lookup" },
  { action: "coach_reply", label: "Coach" },
];

function needsWebsite(action: AgentAiAction): boolean {
  return (
    action === "suggested_reply" ||
    action === "knowledge_lookup" ||
    action === "coach_reply" ||
    action === "rewrite_tone"
  );
}

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
        Select a conversation to open the agent copilot
      </Typography>
    );
  }

  return (
    <AiAssistantShell>
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
      <AiChatThread ref={threadRef} sx={{ pt: 1 }}>
        {messages.length === 0 ? (
          <Typography
            variant="caption"
            sx={{ color: theme.app.dashboard.textMuted, textAlign: "center", py: 2, px: 1 }}
          >
            {AGENT_COPILOT_EMPTY_HINT}
          </Typography>
        ) : (
          messages.map((msg) => (
            <div key={msg.id}>
              <AiChatBubble role={msg.role}>
                {msg.pending ? (
                  <CircularProgress size={14} sx={{ color: theme.app.dashboard.textMuted }} />
                ) : (
                  msg.content
                )}
              </AiChatBubble>
              {msg.role === "assistant" && !msg.pending && onApplyToComposer ? (
                <button
                  type="button"
                  onClick={() => onApplyToComposer(msg.content)}
                  style={{
                    marginTop: 4,
                    marginLeft: 0,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 11,
                    fontWeight: 600,
                    color: theme.app.dashboard.accentViolet,
                    padding: 0,
                  }}
                >
                  Insert into reply
                </button>
              ) : null}
            </div>
          ))
        )}
      </AiChatThread>

      <AiInputFooter>
        <AiInputRow sx={{ mb: 1 }}>
          <ComposerTextField
            fullWidth
            multiline
            minRows={1}
            maxRows={3}
            placeholder="Ask AI… (Enter to send)"
            value={prompt}
            disabled={disabled || busy}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" && !ev.shiftKey) {
                ev.preventDefault();
                const text = prompt.trim();
                if (text && !disabled && !busy) onSendPrompt(text, "coach_reply");
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
            aria-label="Send to AI"
            disabled={!prompt.trim() || disabled || busy}
            onClick={() => {
              const text = prompt.trim();
              if (text) onSendPrompt(text, "coach_reply");
            }}
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
          underline="none"
          sx={{
            display: "block",
            mb: 0.75,
            fontSize: 11,
            fontWeight: 600,
            color: theme.app.dashboard.accentViolet,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Manage copilot knowledge (AI Assistant training) →
        </Link>
        <Typography
          variant="caption"
          sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.75, fontSize: 11 }}
        >
          Quick actions for this conversation:
        </Typography>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {QUICK_ACTIONS.map(({ action, label }) => {
            const actionDisabled =
              disabled || busy || (needsWebsite(action) && websiteRequiredDisabled);
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

