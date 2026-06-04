"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { EmailPreviewFrame } from "./EmailPreviewFrame";

export function EmailDesignPreviewOverlay({
  open,
  title,
  html,
  loading,
  onClose,
  footerActions,
}: {
  open: boolean;
  title: string;
  html: string;
  loading?: boolean;
  onClose: () => void;
  footerActions?: ReactNode;
}) {
  const theme = useTheme() as AppTheme;

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        bgcolor: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          width: "min(720px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: theme.app.dashboard.cardBg,
          borderRadius: 2,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          p: 2.5,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="mediumLarge" fontWeight={700} sx={{ mb: 1.5 }}>
          {title}
        </Typography>
        {loading ? (
          <Skeleton variant="rounded" height={400} />
        ) : (
          <EmailPreviewFrame html={html} title="Preview" />
        )}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          {footerActions}
        </Box>
      </Box>
    </Box>
  );
}
