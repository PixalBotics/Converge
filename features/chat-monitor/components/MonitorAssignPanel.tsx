"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useMonitorAssignChat } from "../hooks/useMonitorAssignChat";

interface MonitorAssignPanelProps {
  conversationId: string | null;
  assignedAgentId: string | null | undefined;
  readOnly?: boolean;
  onAssigned?: () => void;
}

export function MonitorAssignPanel({
  conversationId,
  assignedAgentId,
  readOnly = false,
  onAssigned,
}: MonitorAssignPanelProps) {
  const theme = useTheme() as AppTheme;
  const assign = useMonitorAssignChat(conversationId, {
    enabled: !readOnly && Boolean(conversationId),
  });

  if (!conversationId || readOnly) return null;

  const isUnassigned = !assignedAgentId;
  const title = isUnassigned ? "Assign chat" : "Reassign chat";
  const subtitle = isUnassigned
    ? "Waiting chats are dispatched from monitor to a roster agent."
    : "Transfer this live chat to another roster agent.";

  return (
    <Box
      sx={{
        px: 2,
        pb: 1.5,
        pt: 0.5,
        borderTop: `1px solid ${theme.app.dashboard.cardBorder}`,
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: theme.app.text.primary,
          mb: 0.25,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mb: 1,
          fontSize: 10,
          color: theme.app.dashboard.textMuted,
        }}
      >
        {subtitle}
      </Typography>

      <SelectField
        label="Agent"
        value={assign.selectedUserId}
        onChange={(value) => assign.setSelectedUserId(value)}
        disabled={assign.busy || assign.loadingTargets}
        options={[
          {
            value: "",
            label: assign.loadingTargets ? "Loading agents…" : "Select an agent",
          },
          ...assign.targets.map((agent) => ({
            value: agent.userId,
            label: agent.label,
          })),
        ]}
      />

      <Button
        type="button"
        variant="primary"
        size="small"
        fullWidth
        sx={{ ...gradientPrimaryButtonSx, mt: 1 }}
        disabled={
          assign.busy ||
          assign.loadingTargets ||
          !assign.selectedUserId.trim() ||
          assign.targets.length === 0
        }
        onClick={() =>
          void (async () => {
            const ok = await assign.assign();
            if (ok) onAssigned?.();
          })()
        }
      >
        {isUnassigned ? "Assign to agent" : "Reassign chat"}
      </Button>
    </Box>
  );
}
