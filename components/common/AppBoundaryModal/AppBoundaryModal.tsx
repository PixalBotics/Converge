"use client";

import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import CloudOffOutlined from "@mui/icons-material/CloudOffOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";
import VpnKeyOutlined from "@mui/icons-material/VpnKeyOutlined";
import WifiOffOutlined from "@mui/icons-material/WifiOffOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { AppBoundaryAction, AppBoundaryKind } from "@/lib/app-boundaries";
import { useBodyScrollLock } from "@/lib/ui/useBodyScrollLock";
import { Button, Typography } from "@/components/common";
import { ModalGlassShell } from "@/components/common/FormModal/ModalGlassShell";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  appBoundaryActionsRowSx,
  appBoundaryBackdropSx,
  appBoundaryCardSx,
  appBoundaryIconCircleSx,
} from "./app-boundary-modal.styles";

export type AppBoundaryModalProps = {
  open: boolean;
  kind: AppBoundaryKind;
  title: string;
  description: string;
  dismissible?: boolean;
  actions: AppBoundaryAction[];
  onDismiss?: () => void;
};

function BoundaryIcon({ kind }: { kind: AppBoundaryKind }) {
  const theme = useTheme() as AppTheme;
  const accent =
    kind === "session_expired"
      ? theme.app.dashboard.accentOrange
      : kind === "network"
        ? theme.app.dashboard.accentCyan
        : kind === "permission_denied"
          ? theme.app.dashboard.accentPink
          : kind === "server_error"
            ? theme.app.dashboard.accentPurple
            : theme.app.dashboard.accentBlue;

  const Icon =
    kind === "session_expired"
      ? VpnKeyOutlined
      : kind === "network"
        ? WifiOffOutlined
        : kind === "permission_denied"
          ? LockOutlined
          : kind === "server_error"
            ? CloudOffOutlined
            : ReportProblemOutlined;

  return (
    <Box sx={appBoundaryIconCircleSx(accent)} aria-hidden>
      <Icon sx={{ color: theme.app.dashboard.white95 }} />
    </Box>
  );
}

export function AppBoundaryModal({
  open,
  kind,
  title,
  description,
  dismissible = true,
  actions,
  onDismiss,
}: AppBoundaryModalProps) {
  const theme = useTheme() as AppTheme;
  const [loadingId, setLoadingId] = useState<string | null>(null);
  useBodyScrollLock(open);

  const runAction = useCallback(
    async (action: AppBoundaryAction) => {
      if (!action.onClick) {
        onDismiss?.();
        return;
      }
      setLoadingId(action.id);
      try {
        await action.onClick();
      } finally {
        setLoadingId(null);
        if (!action.keepOpen) {
          onDismiss?.();
        }
      }
    },
    [onDismiss],
  );

  if (!open) return null;

  return (
    <Box
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="app-boundary-title"
      aria-describedby="app-boundary-description"
      sx={appBoundaryBackdropSx}
      onClick={(e) => {
        if (!dismissible) return;
        if (e.target === e.currentTarget) onDismiss?.();
      }}
    >
      <ModalGlassShell
        sx={appBoundaryCardSx}
        onClick={(e) => e.stopPropagation()}
      >
        <BoundaryIcon kind={kind} />

        <Typography
          id="app-boundary-title"
          component="h2"
          variant="regularLarge"
          fontWeight={800}
          sx={{ color: theme.app.text.primary, mt: 2.5, mb: 1.25, lineHeight: 1.25 }}
        >
          {title}
        </Typography>

        <Typography
          id="app-boundary-description"
          variant="medium"
          sx={{
            color: theme.app.dashboard.textMuted,
            maxWidth: 400,
            mx: "auto",
            lineHeight: 1.55,
            mb: 0.5,
          }}
        >
          {description}
        </Typography>

        <Box sx={appBoundaryActionsRowSx}>
          {actions.map((action) => {
            const isPrimary = action.variant !== "secondary";
            const busy = loadingId === action.id;
            return (
              <Button
                key={action.id}
                type="button"
                variant={isPrimary ? "primary" : "secondary"}
                disabled={Boolean(loadingId) && !busy}
                onClick={() => void runAction(action)}
                sx={isPrimary ? gradientPrimaryButtonSx : { minWidth: { xs: "100%", sm: 140 } }}
              >
                {busy ? "Please wait…" : action.label}
              </Button>
            );
          })}
        </Box>
      </ModalGlassShell>
    </Box>
  );
}
