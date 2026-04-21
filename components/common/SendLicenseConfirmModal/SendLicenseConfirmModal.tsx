"use client";

import { useBodyScrollLock } from "@/lib/ui/useBodyScrollLock";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import Check from "@mui/icons-material/Check";
import Settings from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import { resolveSx } from "@/utils/resolveSx";
import { Button, Typography } from "@/components/common";
import { ModalGlassShell } from "@/components/common/FormModal/ModalGlassShell";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  sendLicenseConfirmActionsRowSx,
  sendLicenseConfirmBackdropSx,
  sendLicenseConfirmCardSx,
  sendLicenseConfirmIconCircleSx,
} from "./send-license-confirm-modal.styles";

export interface SendLicenseConfirmModalProps {
  open: boolean;
  /** “No” — dismiss only */
  onDismiss: () => void;
  /** Confirm action (may be async; parent can track loading via `confirmDisabled`). */
  onConfirm: () => void;
  /** Override default “Send License Key ?” title. */
  title?: string;
  /** Override default license copy. */
  description?: string;
  dismissLabel?: string;
  confirmLabel?: string;
  /** Disable confirm (e.g. while POST is in flight). */
  confirmDisabled?: boolean;
}

export function SendLicenseConfirmModal({
  open,
  onDismiss,
  onConfirm,
  title = "Send License Key ?",
  description = "Do you want to send the license key for this Parent Company? An email will be dispatched according to the user type.",
  dismissLabel = "No",
  confirmLabel = "Yes – Send License",
  confirmDisabled = false,
}: SendLicenseConfirmModalProps) {
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
        sx={sendLicenseConfirmCardSx}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={sendLicenseConfirmIconCircleSx} aria-hidden>
          <Settings
            sx={{
              fontSize: 44,
              color: theme.app.dashboard.white95,
              opacity: 0.98,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: theme.palette.common.white,
              boxShadow: `0 1px 4px ${theme.palette.grey[900]}40`,
            }}
          >
            <Check sx={{ fontSize: 18, color: theme.palette.grey[900] }} />
          </Box>
        </Box>

        <Typography
          component="h2"
          variant="regularLarge"
          fontWeight={700}
          sx={{
            color: theme.app.text.primary,
            mt: 2.5,
            mb: 1.5,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="medium"
          sx={{
            color: theme.app.dashboard.textMuted,
            maxWidth: 400,
            mx: "auto",
            lineHeight: 1.55,
            mb: 2.5,
          }}
        >
          {description}
        </Typography>

        <Box sx={sendLicenseConfirmActionsRowSx}>
          <Button type="button" variant="outlined" onClick={onDismiss} sx={resolveSx(filterChromeButtonSx, theme)}>
            {dismissLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            disabled={confirmDisabled}
            sx={gradientPrimaryButtonSx}
            startIcon={<AutoAwesome sx={{ fontSize: 18 }} />}
          >
            {confirmLabel}
          </Button>
        </Box>
      </ModalGlassShell>
    </Box>
  );
}
