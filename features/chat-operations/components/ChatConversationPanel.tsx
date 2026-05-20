"use client";

import { useEffect, useState } from "react";
import MoreVert from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import type { ChatMessage } from "@/services/chat/chat.types";
import type { AiChatMessage } from "../types/ai-chat";
import { chatOpsHeaderStatSx } from "../styles/chat-operations.styles";
import { parseVisitorInfo } from "../utils/visitor-info";
import { ChatComposer } from "./ChatComposer";
import { ChatMessageList } from "./ChatMessageList";
import { PanelColumn, PanelHeader, QueueAvatar } from "../styles/chat-operations.styled";

interface ChatConversationPanelProps {
  conversationId: string | null;
  messages: ChatMessage[];
  visitor: Record<string, unknown> | null;
  conversationMeta?: Record<string, unknown> | null;
  assignedAgentLabel?: string;
  visitorTyping: boolean;
  composer: string;
  onComposerChange: (value: string) => void;
  onSend: () => void;
  onTyping: () => void;
  onStopTyping: () => void;
  onInsertCanned: (text: string) => void;
  onCloseChat?: () => void;
  canSend: boolean;
  aiMessages: AiChatMessage[];
  aiPrompt: string;
  onAiPromptChange: (value: string) => void;
  onSendAiPrompt: (prompt: string, action?: AgentAiAction) => void;
  onApplyAiToComposer: (text: string) => void;
  aiBusy: boolean;
  websiteRequiredDisabled?: boolean;
  availabilityHint?: string | null;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ChatConversationPanel({
  conversationId,
  messages,
  visitor,
  conversationMeta,
  assignedAgentLabel = "You",
  visitorTyping,
  composer,
  onComposerChange,
  onSend,
  onTyping,
  onStopTyping,
  onInsertCanned,
  onCloseChat,
  canSend,
  aiMessages,
  aiPrompt,
  onAiPromptChange,
  onSendAiPrompt,
  onApplyAiToComposer,
  aiBusy,
  websiteRequiredDisabled = false,
  availabilityHint = null,
}: ChatConversationPanelProps) {
  const theme = useTheme() as AppTheme;
  const visitorInfo = parseVisitorInfo(visitor, conversationMeta ?? undefined);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const sessionStartMs = visitorInfo.sessionStartedAt
    ? new Date(visitorInfo.sessionStartedAt).getTime()
    : messages[0]?.createdAt
      ? new Date(messages[0].createdAt).getTime()
      : null;

  useEffect(() => {
    if (!conversationId || !sessionStartMs || Number.isNaN(sessionStartMs)) {
      setElapsedSec(0);
      return;
    }
    const tick = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - sessionStartMs) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [conversationId, sessionStartMs]);

  const pageCount = Math.max(visitorInfo.journey.length, visitorInfo.currentPageUrl ? 1 : 0);

  const hasConversation = Boolean(conversationId);

  return (
    <PanelColumn sx={{ height: "100%", overflow: "hidden" }}>
      {hasConversation ? (
        <PanelHeader
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            py: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
            <QueueAvatar sx={{ width: 44, height: 44, fontSize: 14 }}>{visitorInfo.initials}</QueueAvatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700} sx={{ fontSize: 15, color: theme.app.text.primary }}>
                {visitorInfo.displayName}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  color: visitorTyping ? theme.app.dashboard.accentCyan : theme.palette.success.light,
                  mt: 0.25,
                }}
              >
                {visitorTyping ? "Typing…" : "Online"}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <Box sx={{ textAlign: "right" }}>
                <Typography component="span" sx={chatOpsHeaderStatSx}>
                  Time<strong>{formatDuration(elapsedSec)}</strong>
                </Typography>
                <Typography component="span" sx={{ ...chatOpsHeaderStatSx, display: "block" }}>
                  Pages<strong>{pageCount}</strong>
                </Typography>
              </Box>
            </Box>
            {onCloseChat ? (
              <>
                <IconButton
                  size="small"
                  aria-label="More actions"
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  sx={{ color: theme.app.dashboard.iconMuted }}
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                  slotProps={{
                    paper: {
                      sx: {
                        bgcolor: theme.app.menuSurfaceBg,
                        border: `1px solid ${theme.app.dashboard.cardBorder}`,
                      },
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      setMenuAnchor(null);
                      onCloseChat();
                    }}
                    sx={{ color: theme.palette.error.light }}
                  >
                    Close conversation
                  </MenuItem>
                </Menu>
              </>
            ) : null}
          </Box>
        </PanelHeader>
      ) : null}

      {availabilityHint && hasConversation ? (
        <Box
          sx={{
            px: 2,
            py: 0.75,
            flexShrink: 0,
            borderBottom: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: "rgba(88, 101, 242, 0.08)",
          }}
        >
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
            Website · {availabilityHint}
          </Typography>
        </Box>
      ) : null}

      <ChatMessageList
        messages={messages}
        visitorInitials={visitorInfo.initials}
        visitorTyping={visitorTyping}
        visitorDisplayName={visitorInfo.displayName}
        agentDisplayName={assignedAgentLabel}
        showEmptyPlaceholder={!hasConversation}
      />

      <ChatComposer
        value={composer}
        onChange={onComposerChange}
        onSend={onSend}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        disabled={!canSend}
        onInsertCanned={onInsertCanned}
        aiMessages={aiMessages}
        aiPrompt={aiPrompt}
        onAiPromptChange={onAiPromptChange}
        onSendAiPrompt={onSendAiPrompt}
        onApplyAiToComposer={onApplyAiToComposer}
        aiBusy={aiBusy}
        websiteRequiredDisabled={websiteRequiredDisabled}
        hasConversation={hasConversation}
      />
    </PanelColumn>
  );
}
