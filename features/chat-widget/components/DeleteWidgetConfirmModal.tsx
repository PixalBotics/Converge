"use client";

import type { ReactNode } from "react";
import { useBodyScrollLock } from "@/lib/ui/useBodyScrollLock";
import { dialogBackdropBackground } from "@/lib/ui/dialogBackdrop";
import { FORM_MODAL_PORTAL_Z_INDEX } from "@/lib/ui/dialogStacking";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { ModalGlassShell } from "@/components/common/FormModal/ModalGlassShell";
import {
  sendLicenseConfirmActionsRowSx,
  sendLicenseConfirmCardSx,
  sendLicenseConfirmIconCircleSx,
} from "@/components/common/SendLicenseConfirmModal/send-license-confirm-modal.styles";

export type DeleteWidgetConfirmModalProps = {
  open: boolean;
  description: ReactNode;
  widgetKey?: string;
  onDismiss: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
};

export function DeleteWidgetConfirmModal({
  open,
  description,
  widgetKey,
  onDismiss,
  onConfirm,
  isDeleting,
}: DeleteWidgetConfirmModalProps) {
  const theme = useTheme() as AppTheme;
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: FORM_MODAL_PORTAL_Z_INDEX,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: dialogBackdropBackground(theme),
        p: 2,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onDismiss();
      }}
      role="presentation"
    >
      <ModalGlassShell
        sx={
          [
            sendLicenseConfirmCardSx,
            {
              p: { xs: 3, sm: 4 },
              maxWidth: 440,
              borderRadius: "18px",
              alignItems: "stretch",
              textAlign: "left",
            },
          ] as SxProps<Theme>
        }
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box
            sx={{
              ...(sendLicenseConfirmIconCircleSx as object),
              flexShrink: 0,
              width: 56,
              height: 56,
              background: `radial-gradient(ellipse 85% 85% at 50% 32%, ${alpha(theme.palette.warning.main, 0.35)} 0%, ${alpha(
                theme.palette.common.white,
                0.06,
              )} 55%, transparent 72%)`,
            }}
            aria-hidden
          >
            <WarningAmberRounded sx={{ fontSize: 32, color: theme.palette.warning.light }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              component="h2"
              variant="regularLarge"
              fontWeight={700}
              sx={{ color: theme.app.text.primary, mb: 1, lineHeight: 1.3 }}
            >
              Delete this widget?
            </Typography>
            <Typography
              variant="medium"
              sx={{
                color: theme.app.dashboard.textMuted,
                lineHeight: 1.55,
              }}
            >
              {description}
            </Typography>
            {widgetKey?.trim() ? (
              <Typography
                variant="small"
                sx={{
                  mt: 1.5,
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  color: theme.app.text.primary,
                  lineHeight: 1.5,
                }}
              >
                {widgetKey.trim()}
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Box sx={{ ...sendLicenseConfirmActionsRowSx, mt: 3, justifyContent: "flex-end" }}>
          <Button type="button" variant="secondary" onClick={onDismiss} disabled={isDeleting} sx={{ minWidth: 100 }}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
            startIcon={<DeleteOutline sx={{ fontSize: 18 }} />}
            sx={{ minWidth: 120 }}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </Box>
      </ModalGlassShell>
    </Box>
  );
}
