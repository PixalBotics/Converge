"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { ChatMessageList } from "@/features/chat-operations/components/ChatMessageList";
import { parseVisitorInfo } from "@/features/chat-operations/utils/visitor-info";
import {
  PanelColumn,
  PanelHeader,
  QueueAvatar,
} from "@/features/chat-operations/styles/chat-operations.styled";
import { extractVisitorPresentation } from "@/services/chat/visitor-presentation";
import { agentDisplayName } from "@/services/chat/monitor-normalizers";
import type { MonitorConversationRow } from "@/services/chat/monitor.types";
import type { ChatMessage } from "@/services/chat/chat.types";
import { chatMonitorReadOnlyBannerSx } from "../styles/chat-monitor.styles";
import { MonitorActionsPanel } from "./MonitorActionsPanel";

interface MonitorTranscriptPanelProps {
  conversation: MonitorConversationRow | null;
  messages: ChatMessage[];
  visitor: Record<string, unknown> | null;
  loading: boolean;
  currentUserId?: string | null;
  hasOperational?: (p: string) => boolean;
  monitorReadOnly?: boolean;
  supervisorControlUserId?: string | null;
  onSupervisorAction?: () => void;
  onMessageSent?: () => void;
}

export function MonitorTranscriptPanel({
  conversation,
  messages,
  visitor,
  loading,
  currentUserId = null,
  hasOperational = () => false,
  monitorReadOnly = false,
  supervisorControlUserId = null,
  onSupervisorAction,
  onMessageSent,
}: MonitorTranscriptPanelProps) {
  const activeSupervisorId =
    supervisorControlUserId ?? conversation?.supervisorControlUserId ?? null;
  const theme = useTheme() as AppTheme;
  const vp = conversation ? extractVisitorPresentation(conversation) : null;
  const visitorInfo = parseVisitorInfo(visitor);
  const title = vp?.inboxTitle || vp?.displayName || visitorInfo.displayName;
  const subtitle =
    vp
      ? [vp.originLabel, vp.locationLabel].filter(Boolean).join(" · ")
      : null;

  const hasConversation = Boolean(conversation);

  return (
    <PanelColumn sx={{ height: "100%", overflow: "hidden" }}>
      <Box sx={chatMonitorReadOnlyBannerSx}>
        <Typography variant="caption" sx={{ fontSize: 11, color: theme.app.dashboard.textMuted }}>
          {monitorReadOnly
            ? "Read-only monitor — you can view this chat but cannot whisper or take control."
            : activeSupervisorId
              ? "Monitor control active — assigned agent is read-only until control is released."
              : "Monitor view — use monitor actions below to whisper or take control when allowed."}
        </Typography>
      </Box>

      {hasConversation ? (
        <PanelHeader sx={{ py: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          <QueueAvatar sx={{ width: 44, height: 44 }}>{visitorInfo.initials}</QueueAvatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography fontWeight={700} sx={{ fontSize: 15 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {subtitle}
              </Typography>
            ) : null}
            <Box sx={{ display: "flex", gap: 0.75, mt: 0.75, flexWrap: "wrap" }}>
              <Chip label={conversation!.status} size="small" sx={{ height: 22, fontSize: 11 }} />
              <Chip
                label={`Agent: ${agentDisplayName(conversation!.agent)}`}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: 11 }}
              />
            </Box>
          </Box>
        </PanelHeader>
      ) : null}

      {loading ? (
        <Box sx={{ p: 3 }}>
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading transcript…</Typography>
        </Box>
      ) : (
        <ChatMessageList
          messages={messages}
          visitorInitials={visitorInfo.initials}
          visitorDisplayName={title}
          agentDisplayName={agentDisplayName(conversation?.agent ?? null)}
          showEmptyPlaceholder={!hasConversation}
        />
      )}

      {hasConversation && conversation?.status !== "closed" ? (
        <MonitorActionsPanel
          conversationId={conversation.id}
          supervisorControlUserId={activeSupervisorId}
          currentUserId={currentUserId}
          hasOperational={hasOperational}
          readOnly={monitorReadOnly}
          onActionComplete={onSupervisorAction}
          onMessageSent={onMessageSent}
        />
      ) : null}
    </PanelColumn>
  );
}
