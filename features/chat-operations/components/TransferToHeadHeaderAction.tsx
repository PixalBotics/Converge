"use client";

import { useState } from "react";
import ForwardToInboxOutlined from "@mui/icons-material/ForwardToInboxOutlined";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { chatOpsConversationMetaChipHeight } from "../styles/chat-operations.styles";
import { useTransferToPoolHead } from "../hooks/useTransferToPoolHead";

interface TransferToHeadHeaderActionProps {
  conversationId: string | null;
  disabled?: boolean;
}

export function TransferToHeadHeaderAction({
  conversationId,
  disabled = false,
}: TransferToHeadHeaderActionProps) {
  const theme = useTheme() as AppTheme;
  const { user } = useAuth();
  const transfer = useTransferToPoolHead(conversationId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!transfer.enabled || user?.isPoolHead) return null;

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="compact"
        disabled={disabled || transfer.busy}
        aria-label="Transfer to pool head"
        onClick={() => setConfirmOpen(true)}
        sx={{
          minWidth: 0,
          height: chatOpsConversationMetaChipHeight,
          px: 1.25,
          py: 0,
          fontSize: 11,
          fontWeight: 700,
          gap: 0.5,
          color: theme.app.dashboard.accentOrange,
          border: `1px solid ${alpha(theme.app.dashboard.accentOrange, 0.45)}`,
          bgcolor: alpha(theme.app.dashboard.accentOrange, 0.1),
          "&:hover": {
            bgcolor: alpha(theme.app.dashboard.accentOrange, 0.18),
            borderColor: alpha(theme.app.dashboard.accentOrange, 0.6),
          },
        }}
      >
        <ForwardToInboxOutlined sx={{ fontSize: 16 }} />
        Transfer to head
      </Button>

      <Dialog
        open={confirmOpen}
        onClose={() => !transfer.busy && setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>
          Transfer to pool head?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            This chat will move to your pool head&apos;s inbox. They will see who
            transferred it.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            type="button"
            variant="secondary"
            size="small"
            disabled={transfer.busy}
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="small"
            disabled={disabled || transfer.busy}
            onClick={() => {
              void transfer.transfer().then((ok) => {
                if (ok) setConfirmOpen(false);
              });
            }}
          >
            {transfer.busy ? "Transferring…" : "Transfer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
