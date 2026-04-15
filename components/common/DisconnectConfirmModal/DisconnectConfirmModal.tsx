"use client";

import { useBodyScrollLock } from "@/lib/ui/useBodyScrollLock";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import Check from "@mui/icons-material/Check";
import Settings from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  sendLicenseConfirmActionsRowSx,
  sendLicenseConfirmBackdropSx,
  sendLicenseConfirmCardSx,
  sendLicenseConfirmIconCircleSx,
} from "../SendLicenseConfirmModal/send-license-confirm-modal.styles";

export interface DisconnectConfirmModalProps {
  open: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
}

export function DisconnectConfirmModal({ open, onDismiss, onConfirm }: DisconnectConfirmModalProps) {
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
      <DashboardCard
        sx={
          [
            sendLicenseConfirmCardSx,
            {
              p: { xs: 3, sm: 4 },
              maxWidth: 440,
              borderRadius: "18px",
            },
          ] as SxProps<Theme>
        }
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
          Disconnect !
        </Typography>

        <Typography
          variant="medium"
          sx={{
            color: theme.app.dashboard.textMuted,
            maxWidth: 380,
            mx: "auto",
            lineHeight: 1.55,
            mb: 2.5,
          }}
        >
          Are you sure you want to disconnect this integration?
        </Typography>

        <Box sx={sendLicenseConfirmActionsRowSx}>
          <Button type="button" variant="secondary" onClick={onDismiss} sx={{ minWidth: 120 }}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            sx={gradientPrimaryButtonSx}
            startIcon={<AutoAwesome sx={{ fontSize: 18 }} />}
          >
            Disconnect
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
