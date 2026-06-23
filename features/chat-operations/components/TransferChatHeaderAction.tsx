"use client";

import { useState } from "react";
import ForwardToInboxOutlined from "@mui/icons-material/ForwardToInboxOutlined";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { chatOpsConversationMetaChipHeight } from "../styles/chat-operations.styles";
import { useTransferChat } from "../hooks/useTransferChat";

interface TransferChatHeaderActionProps {
  conversationId: string | null;
  disabled?: boolean;
}

export function TransferChatHeaderAction({
  conversationId,
  disabled = false,
}: TransferChatHeaderActionProps) {
  const theme = useTheme() as AppTheme;
  const transfer = useTransferChat(conversationId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!transfer.enabled) return null;

  const openDialog = () => {
    setConfirmOpen(true);
    void transfer.loadTargets();
  };

  const selectedTarget = transfer.targets.find(
    (t) => t.userId === transfer.selectedUserId,
  );

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="compact"
        disabled={disabled || transfer.busy}
        aria-label="Transfer chat"
        onClick={openDialog}
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
        Transfer
      </Button>

      <Dialog
        open={confirmOpen}
        onClose={() => !transfer.busy && setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>
          Transfer chat
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}
          >
            Choose an agent assigned to this website. They will receive this chat
            in their inbox.
          </Typography>

          <FormControl fullWidth size="small" disabled={transfer.loadingTargets}>
            <InputLabel id="transfer-chat-agent-label">Agent</InputLabel>
            <Select
              labelId="transfer-chat-agent-label"
              label="Agent"
              value={transfer.selectedUserId}
              onChange={(e) => transfer.setSelectedUserId(e.target.value)}
              displayEmpty
              renderValue={(v) => {
                if (!v) {
                  return (
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: theme.app.dashboard.textMuted }}
                    >
                      {transfer.loadingTargets
                        ? "Loading agents…"
                        : "Select agent"}
                    </Typography>
                  );
                }
                return selectedTarget?.label ?? "Selected agent";
              }}
            >
              <MenuItem value="">
                <em>Select agent</em>
              </MenuItem>
              {transfer.targets.map((agent) => (
                <MenuItem key={agent.userId} value={agent.userId}>
                  {agent.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!transfer.loadingTargets && transfer.targets.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ color: theme.palette.warning.light, mt: 1.5 }}
            >
              No other agents are assigned to this website.
            </Typography>
          ) : null}
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
            disabled={
              disabled ||
              transfer.busy ||
              !transfer.selectedUserId.trim() ||
              transfer.loadingTargets
            }
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
