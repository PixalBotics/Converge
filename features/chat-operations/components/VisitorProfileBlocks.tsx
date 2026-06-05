"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  chatOpsProfileMetaGridSx,
  chatOpsProfileMetaLabelSx,
  chatOpsProfileMetaValueSx,
} from "../styles/chat-operations.styles";
import { mergeSx } from "@/lib/mui/merge-sx";

export function ProfileMetaGrid({ children }: { children: ReactNode }) {
  return (
    <Box sx={mergeSx(chatOpsProfileMetaGridSx, { px: 0, py: 0 })}>
      {children}
    </Box>
  );
}

/** Two-column cell: icon + label on top, value below (reference layout). */
export function ProfileMetaGridCell({
  icon,
  label,
  children,
  href,
  muted = false,
  fullWidth = false,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  href?: string | null;
  muted?: boolean;
  fullWidth?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;

  return (
    <Box
      sx={{
        minWidth: 0,
        p: 1.25,
        borderRadius: 1.5,
        bgcolor: alpha(d.overlayLight, 0.35),
        border: `1px solid ${alpha(d.cardBorder, 0.22)}`,
        ...(fullWidth ? { gridColumn: "1 / -1" } : {}),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.65 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            flexShrink: 0,
            borderRadius: 0.75,
            bgcolor: alpha(d.accentIndigo, 0.12),
            color: d.accentViolet,
          }}
        >
          {icon}
        </Box>
        <Typography component="div" sx={chatOpsProfileMetaLabelSx}>
          {label}
        </Typography>
      </Box>
      <BlockValue href={href} muted={muted}>
        {children}
      </BlockValue>
    </Box>
  );
}

export function ProfileMetaBlock({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        px: 1.25,
        py: 1,
        borderRadius: 1.25,
        bgcolor: alpha(d.overlayLight, 0.45),
        border: `1px solid ${alpha(d.cardBorder, 0.28)}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          flexShrink: 0,
          borderRadius: 1,
          bgcolor: alpha(d.accentIndigo, 0.14),
          color: d.accentViolet,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1, pt: 0.1 }}>
        <Typography component="div" sx={chatOpsProfileMetaLabelSx}>
          {label}
        </Typography>
        <Box sx={{ mt: 0.35 }}>{children}</Box>
      </Box>
    </Box>
  );
}

export function BlockValue({
  children,
  href,
  muted = false,
}: {
  children: ReactNode;
  href?: string | null;
  muted?: boolean;
}) {
  const theme = useTheme() as AppTheme;

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={mergeSx(chatOpsProfileMetaValueSx, {
          display: "block",
          wordBreak: "break-all",
          color: theme.app.dashboard.accentBlue,
          fontWeight: 500,
        })}
      >
        {children}
      </Link>
    );
  }

  return (
    <Typography
      component="div"
      sx={mergeSx(chatOpsProfileMetaValueSx, {
        color: muted ? theme.app.dashboard.textMuted : theme.app.text.primary,
      })}
    >
      {children}
    </Typography>
  );
}

export function ProfileMetaBlockStack({ children }: { children: ReactNode }) {
  return (
    <Stack spacing={0.75} sx={{ px: 2, pb: 1.5, pt: 0.25 }}>
      {children}
    </Stack>
  );
}

export function ProfileMetaGridSection({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ px: 2, pb: 1.5, pt: 0.25 }}>
      <ProfileMetaGrid>{children}</ProfileMetaGrid>
    </Box>
  );
}
