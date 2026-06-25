"use client";

import SendRounded from "@mui/icons-material/SendRounded";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import type { AppTheme } from "@/theme/theme";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import type { AiChatMessage } from "../types/ai-chat";
import { ComposerDrawerTabs } from "./ComposerDrawerTabs";
import { Typography } from "@/components/common";
import {
  ComposerIdleBar,
  ComposerInputShell,
  ComposerRow,
  ComposerTextField,
  ComposerWrap,
} from "../styles/chat-operations.styled";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping: (draft?: string) => void;
  onStopTyping: () => void;
  disabled?: boolean;
  onInsertCanned: (text: string) => void;
  websiteId?: string | null;
  departmentId?: string | null;
  aiMessages: AiChatMessage[];
  aiPrompt: string;
  onAiPromptChange: (value: string) => void;
  onSendAiPrompt: (prompt: string, action?: AgentAiAction) => void;
  onApplyAiToComposer: (text: string) => void;
  aiBusy: boolean;
  websiteRequiredDisabled?: boolean;
  hasConversation: boolean;
  agentInboxEnabled?: boolean;
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  onTyping,
  onStopTyping,
  disabled = false,
  onInsertCanned,
  websiteId = null,
  departmentId = null,
  aiMessages,
  aiPrompt,
  onAiPromptChange,
  onSendAiPrompt,
  onApplyAiToComposer,
  aiBusy,
  websiteRequiredDisabled = false,
  hasConversation,
  agentInboxEnabled = true,
}: ChatComposerProps) {
  const theme = useTheme() as AppTheme;

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend();
    onStopTyping();
  };

  if (!hasConversation) {
    return (
      <ComposerIdleBar>
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, fontSize: 13 }}>
          Select a conversation from the inbox to reply
        </Typography>
      </ComposerIdleBar>
    );
  }

  if (disabled) {
    return (
      <ComposerIdleBar>
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, fontSize: 13 }}>
          Read-only transcript — new visitor messages may reopen this chat
        </Typography>
      </ComposerIdleBar>
    );
  }

  return (
    <ComposerWrap>
      <ComposerDrawerTabs
        onInsertCanned={onInsertCanned}
        websiteId={websiteId}
        departmentId={departmentId}
        aiMessages={aiMessages}
        aiPrompt={aiPrompt}
        onAiPromptChange={onAiPromptChange}
        onSendAiPrompt={onSendAiPrompt}
        onApplyAiToComposer={onApplyAiToComposer}
        aiBusy={aiBusy}
        aiDisabled={disabled}
        websiteRequiredDisabled={websiteRequiredDisabled}
        hasConversation={hasConversation}
        agentInboxEnabled={agentInboxEnabled}
      >
        <ComposerRow>
          <ComposerInputShell>
            <ComposerTextField
              fullWidth
              multiline
              minRows={1}
              maxRows={4}
              placeholder="Reply to visitor…"
              value={value}
              disabled={disabled}
              autoComplete="off"
              inputProps={{
                autoComplete: "off",
                "aria-label": "Reply to visitor",
                "data-1p-ignore": "true",
                "data-lpignore": "true",
              }}
              onChange={(e) => {
                const next = e.target.value;
                onChange(next);
                onTyping(next);
              }}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" && !ev.shiftKey) {
                  ev.preventDefault();
                  handleSend();
                }
              }}
            />
          </ComposerInputShell>
          <IconButton
            aria-label="Send message"
            disabled={!value.trim() || disabled}
            onClick={handleSend}
            sx={mergeSx(
              {
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: "50%",
                minWidth: 44,
              },
              gradientPrimaryButtonSx,
            )}
          >
            <SendRounded sx={{ fontSize: 20 }} />
          </IconButton>
        </ComposerRow>
      </ComposerDrawerTabs>
    </ComposerWrap>
  );
}
