"use client";

import { useState } from "react";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { dashboardCardSurfaceProps } from "../styles/chat-semantic";
import { CloseChatPanel } from "../styles/chat-operations.styled";

interface CloseChatSectionProps {
  visitorName: string;
  conversationId: string | null;
  disabled?: boolean;
  onCloseChat: () => void | Promise<void>;
}

export function CloseChatSection({
  visitorName,
  conversationId,
  disabled = false,
  onCloseChat,
}: CloseChatSectionProps) {
  const theme = useTheme() as AppTheme;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  if (!conversationId) return null;

  const handleConfirm = async () => {
    setClosing(true);
    try {
      await onCloseChat();
      setConfirmOpen(false);
    } finally {
      setClosing(false);
    }
  };

  return (
    <>
      <CloseChatPanel>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.error.main, 0.12),
              border: `1px solid ${alpha(theme.palette.error.main, 0.28)}`,
              color: theme.palette.error.light,
            }}
          >
            <CloseRounded fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="medium" color="white" fontWeight={600} sx={{ fontSize: 14 }}>
              Close chat
            </Typography>
            <Typography
              variant="small"
              sx={{ color: theme.app.dashboard.textMuted, fontSize: 12, mt: 0.35, lineHeight: 1.45 }}
            >
              End the live session with {visitorName}. The conversation leaves your active inbox and
              may be reassigned if your team uses backup routing.
            </Typography>
          </Box>
        </Box>

        <Button
          type="button"
          variant="secondary"
          fullWidth
          disabled={disabled || closing}
          onClick={() => setConfirmOpen(true)}
          sx={{
            mt: 1.5,
            borderColor: alpha(theme.palette.error.main, 0.45),
            color: theme.palette.error.light,
            "&:hover": {
              borderColor: theme.palette.error.main,
              bgcolor: alpha(theme.palette.error.main, 0.1),
            },
          }}
        >
          Close conversation
        </Button>
      </CloseChatPanel>

      <Dialog
        open={confirmOpen}
        onClose={() => !closing && setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            ...dashboardCardSurfaceProps(theme),
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            minWidth: { xs: "92vw", sm: 400 },
          },
        }}
      >
        <DialogTitle sx={{ color: theme.app.text.primary, fontWeight: 700, pb: 0.5 }}>
          Close this chat?
        </DialogTitle>
        <DialogContent>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
            You are about to close the conversation with{" "}
            <Box component="span" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
              {visitorName}
            </Box>
            . Unread messages will be cleared from your queue.
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 2,
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: alpha(theme.app.dashboard.overlayLight, 0.35),
              border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.55)}`,
            }}
          >
            <ChatBubbleOutline sx={{ fontSize: 18, color: theme.app.dashboard.textMuted }} />
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
              ID · {conversationId.slice(0, 18)}
              {conversationId.length > 18 ? "…" : ""}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            type="button"
            variant="secondary"
            disabled={closing}
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={closing}
            onClick={() => void handleConfirm()}
            sx={{
              bgcolor: theme.palette.error.main,
              "&:hover": { bgcolor: theme.palette.error.dark },
            }}
          >
            {closing ? "Closing…" : "Yes, close chat"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

