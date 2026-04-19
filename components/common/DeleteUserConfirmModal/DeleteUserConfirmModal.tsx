"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import DeleteForever from "@mui/icons-material/DeleteForever";
import { FormModal, InputField, Typography } from "@/components/common";
import type { AppTheme } from "@/theme/theme";

/** User must type this exactly (case-sensitive) before delete is enabled. */
export const USER_DELETE_CONFIRMATION_TOKEN = "DELETE";

export type DeleteUserConfirmModalProps = {
  open: boolean;
  displayName: string;
  email: string;
  onClose: () => void;
  /** Invoked only when confirmation token matches and the user clicks delete. */
  onConfirm: () => void;
  isDeleting: boolean;
  theme: AppTheme;
};

export function DeleteUserConfirmModal({
  open,
  displayName,
  email,
  onClose,
  onConfirm,
  isDeleting,
  theme,
}: DeleteUserConfirmModalProps) {
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!open) setToken("");
  }, [open]);

  const trimmed = token.trim();
  const isConfirmed = trimmed === USER_DELETE_CONFIRMATION_TOKEN;

  const summary = useMemo(() => {
    const name = displayName.trim() || "—";
    const em = email.trim() || "—";
    return `${name} (${em})`;
  }, [displayName, email]);

  return (
    <FormModal
      open={open}
      title="Delete user?"
      description={
        "This permanently soft-deletes the account (sets deletedAt and related data). " +
        "You cannot restore it from this screen. You cannot delete your own account."
      }
      onClose={onClose}
      onSave={onConfirm}
      primaryButtonLabel={isDeleting ? "Deleting…" : "Delete user"}
      primaryButtonDisabled={!isConfirmed || isDeleting}
      cancelButtonLabel="Cancel"
      primaryStartIcon={<DeleteForever sx={{ fontSize: 18 }} />}
      maxWidth={480}
      fitContent
      closeButtonVariant="filled"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: theme.app.dashboard.textMuted,
            lineHeight: 1.55,
          }}
        >
          User: <strong style={{ color: theme.app.text.primary }}>{summary}</strong>
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.app.dashboard.textMuted,
            lineHeight: 1.55,
          }}
        >
          To confirm, type{" "}
          <Box
            component="code"
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              bgcolor: "rgba(0,0,0,0.2)",
              color: theme.app.text.primary,
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.8125rem",
            }}
          >
            {USER_DELETE_CONFIRMATION_TOKEN}
          </Box>{" "}
          below exactly as shown (capital letters).
        </Typography>
        <InputField
          label="Confirmation"
          placeholder={USER_DELETE_CONFIRMATION_TOKEN}
          name="delete-confirm-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={isDeleting}
          autoComplete="off"
          inputProps={{
            "aria-label": "Type DELETE to confirm user deletion",
            spellCheck: false,
          }}
          error={trimmed.length > 0 && !isConfirmed && trimmed.length >= USER_DELETE_CONFIRMATION_TOKEN.length}
          helperText={
            trimmed.length > 0 && !isConfirmed && trimmed.length >= USER_DELETE_CONFIRMATION_TOKEN.length
              ? `Text must match ${USER_DELETE_CONFIRMATION_TOKEN} exactly.`
              : "\u00a0"
          }
        />
      </Box>
    </FormModal>
  );
}
