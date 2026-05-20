"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { useBodyScrollLock } from "@/lib/ui/useBodyScrollLock";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { ModalGlassShell } from "@/components/common/FormModal/ModalGlassShell";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  sendLicenseConfirmActionsRowSx,
  sendLicenseConfirmBackdropSx,
  sendLicenseConfirmCardSx,
  sendLicenseConfirmIconCircleSx,
} from "../SendLicenseConfirmModal/send-license-confirm-modal.styles";

export type ConfirmActionModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onDismiss: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  /** `danger` — red confirm (delete / remove). Default `primary` uses gradient CTA. */
  confirmButtonVariant?: "primary" | "danger";
};

export function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onDismiss,
  onConfirm,
  isLoading = false,
  confirmButtonVariant = "primary",
}: ConfirmActionModalProps) {
  const theme = useTheme() as AppTheme;
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <Box
      sx={sendLicenseConfirmBackdropSx}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
      role="presentation"
    >
      <ModalGlassShell
        sx={
          [
            sendLicenseConfirmCardSx,
            {
              p: { xs: 3, sm: 4 },
              maxWidth: 460,
              borderRadius: "18px",
            },
          ] as SxProps<Theme>
        }
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={sendLicenseConfirmIconCircleSx} aria-hidden>
          <WarningAmber
            sx={{
              fontSize: 44,
              color: theme.app.dashboard.white95,
              opacity: 0.98,
            }}
          />
        </Box>

        <Typography
          component="h2"
          variant="regularLarge"
          fontWeight={800}
          sx={{
            color: theme.app.text.primary,
            mt: 2.5,
            mb: 1.25,
            lineHeight: 1.25,
            textAlign: "center",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="medium"
          sx={{
            color: theme.app.dashboard.textMuted,
            maxWidth: 420,
            mx: "auto",
            lineHeight: 1.55,
            mb: 2.5,
            textAlign: "center",
          }}
        >
          {description}
        </Typography>

        <Box sx={sendLicenseConfirmActionsRowSx}>
          <Button type="button" variant="secondary" onClick={onDismiss} sx={{ minWidth: 120 }} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmButtonVariant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            sx={confirmButtonVariant === "danger" ? undefined : gradientPrimaryButtonSx}
            disabled={isLoading}
          >
            {isLoading ? "Please wait…" : confirmLabel}
          </Button>
        </Box>
      </ModalGlassShell>
    </Box>
  );
}

