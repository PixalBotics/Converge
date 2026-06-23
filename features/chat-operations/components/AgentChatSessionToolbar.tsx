"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import PauseOutlined from "@mui/icons-material/PauseOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useAgentChatSession } from "@/lib/hooks/chat/useAgentChatSession";
import { chatOpsInboxToolbarSx } from "../styles/chat-operations.styles";

export function AgentChatSessionToolbar() {
  const theme = useTheme() as AppTheme;
  const {
    session,
    isAcceptingChats,
    onMeeting,
    canStartMeeting,
    startSession,
    pauseSession,
    meetingIn,
    meetingOut,
  } = useAgentChatSession();

  const statusLabel = isAcceptingChats
    ? "Receiving chats"
    : onMeeting
      ? "In meeting — chat paused for assignments"
      : "Paused — offline for new chats";
  const statusColor = isAcceptingChats
    ? theme.palette.success.light
    : onMeeting
      ? theme.palette.info.light
      : theme.app.dashboard.textMuted;
  const statusDot = isAcceptingChats
    ? theme.palette.success.main
    : onMeeting
      ? theme.palette.info.main
      : theme.app.dashboard.textMuted;

  const chatMinutes = session.attendanceActivity?.chatMinutes;
  const meetingMinutes = session.attendanceActivity?.meetingMinutes;

  return (
    <Box sx={chatOpsInboxToolbarSx}>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: theme.app.text.primary }}>
          Agent availability
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.35 }}>
          <Box
            component="span"
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: statusDot,
              flexShrink: 0,
            }}
          />
          <Typography sx={{ fontSize: 11, color: statusColor, lineHeight: 1.4 }}>
            {statusLabel}
          </Typography>
        </Box>
        {(chatMinutes != null || meetingMinutes != null) && (
          <Typography
            sx={{ fontSize: 10, color: theme.app.dashboard.textMuted, mt: 0.35, lineHeight: 1.4 }}
          >
            {chatMinutes != null ? `Chat ${chatMinutes} min` : null}
            {chatMinutes != null && meetingMinutes != null ? " · " : null}
            {meetingMinutes != null ? `Meeting ${meetingMinutes} min` : null}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, flexWrap: "wrap" }}>
        {onMeeting ? (
          <Button
            type="button"
            variant="secondary"
            size="compact"
            disabled={session.busy}
            startIcon={<GroupsOutlined sx={{ fontSize: 16 }} />}
            onClick={() => void meetingOut()}
            sx={{
              minWidth: 0,
              height: 34,
              px: 1.5,
              fontSize: 12,
              borderColor: alpha(theme.palette.info.main, 0.45),
              color: theme.palette.info.light,
            }}
          >
            {session.busy ? "Ending…" : "Off Meeting"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="compact"
            disabled={session.busy || !canStartMeeting}
            startIcon={<GroupsOutlined sx={{ fontSize: 16 }} />}
            onClick={() => void meetingIn()}
            sx={{ minWidth: 0, height: 34, px: 1.5, fontSize: 12 }}
          >
            On Meeting
          </Button>
        )}

        {isAcceptingChats ? (
          <Button
            type="button"
            variant="secondary"
            size="compact"
            disabled={session.busy || onMeeting}
            startIcon={<PauseOutlined sx={{ fontSize: 16 }} />}
            onClick={() => void pauseSession()}
            sx={{
              minWidth: 0,
              height: 34,
              px: 1.5,
              fontSize: 12,
              borderColor: alpha(theme.palette.warning.main, 0.45),
              color: theme.palette.warning.light,
              "&:hover": {
                borderColor: alpha(theme.palette.warning.main, 0.7),
                bgcolor: alpha(theme.palette.warning.main, 0.08),
              },
            }}
          >
            {session.busy ? "Pausing…" : "Chat Pause"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="compact"
            disabled={session.busy || onMeeting}
            startIcon={<PlayArrowOutlined sx={{ fontSize: 16 }} />}
            onClick={() => void startSession()}
            sx={{
              ...gradientPrimaryButtonSx,
              minWidth: 0,
              height: 34,
              px: 1.75,
              fontSize: 12,
            }}
          >
            {session.busy ? "Starting…" : "Chat Start"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
