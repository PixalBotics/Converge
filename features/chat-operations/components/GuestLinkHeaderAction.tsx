"use client";

import { useState } from "react";
import GroupAddOutlined from "@mui/icons-material/GroupAddOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Popover from "@mui/material/Popover";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { chatOpsConversationMetaChipHeight } from "../styles/chat-operations.styles";
import { useGuestLinkActions } from "../hooks/useGuestLinkActions";

interface GuestLinkHeaderActionProps {
  conversationId: string | null;
  hasOperational: (p: string) => boolean;
  serviceChannel?: string | null;
  disabled?: boolean;
}

export function GuestLinkHeaderAction({
  conversationId,
  hasOperational,
  serviceChannel = null,
  disabled = false,
}: GuestLinkHeaderActionProps) {
  const theme = useTheme() as AppTheme;
  const guest = useGuestLinkActions(
    conversationId,
    hasOperational,
    serviceChannel,
  );
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  if (!guest.enabled) return null;

  const open = Boolean(anchor);
  const target = guest.target;

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="compact"
        disabled={disabled || guest.busy}
        aria-label="Involve supervisor"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          minWidth: 0,
          height: chatOpsConversationMetaChipHeight,
          px: 1.25,
          py: 0,
          fontSize: 11,
          fontWeight: 700,
          gap: 0.5,
          color: theme.app.dashboard.accentBlue,
          border: `1px solid ${alpha(theme.app.dashboard.accentBlue, 0.45)}`,
          bgcolor: alpha(theme.app.dashboard.accentBlue, 0.1),
          "&:hover": {
            bgcolor: alpha(theme.app.dashboard.accentBlue, 0.18),
            borderColor: alpha(theme.app.dashboard.accentBlue, 0.6),
          },
        }}
      >
        <GroupAddOutlined sx={{ fontSize: 16 }} />
        Involve
      </Button>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.75,
              p: 1.5,
              minWidth: 260,
              maxWidth: 320,
              bgcolor: theme.app.dashboard.cardBg,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
            },
          },
        }}
      >
        <Typography
          fontWeight={700}
          sx={{ fontSize: 13, color: theme.app.text.primary, mb: 1 }}
        >
          Involve supervisor
        </Typography>

        {guest.targetLoading ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Loading…
          </Typography>
        ) : target ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
            {target.topicLabel ? (
              <Chip label={target.topicLabel} size="small" sx={{ height: 22, fontSize: 10 }} />
            ) : null}
            <Chip
              label={target.departmentName}
              size="small"
              sx={{ height: 22, fontSize: 10 }}
            />
            <Chip
              label={
                target.canSend
                  ? `${target.supervisorCount} supervisor${target.supervisorCount === 1 ? "" : "s"}`
                  : "No supervisors"
              }
              size="small"
              color={target.canSend ? "success" : "warning"}
              sx={{ height: 22, fontSize: 10 }}
            />
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
            Could not load target.
          </Typography>
        )}

        <Button
          type="button"
          variant="primary"
          size="small"
          fullWidth
          sx={{ ...gradientPrimaryButtonSx }}
          disabled={disabled || guest.sendDisabled}
          onClick={() => {
            void guest.sendLink().then((ok) => {
              if (ok) setAnchor(null);
            });
          }}
        >
          {guest.busy ? "Sending…" : "Send involvement link"}
        </Button>
      </Popover>
    </>
  );
}
