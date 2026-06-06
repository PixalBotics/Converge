"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/lib/ui/useBodyScrollLock";
import { dialogBackdropBackground } from "@/lib/ui/dialogBackdrop";
import { FORM_MODAL_PORTAL_Z_INDEX } from "@/lib/ui/dialogStacking";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { ModalGlassShell } from "@/components/common/FormModal/ModalGlassShell";
import { modalCloseIconButtonSx } from "@/lib/design-system";
import { CloseCircleIcon } from "@/components/common/icons";
import { IconSlot } from "@/components/common/IconSlot";
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
  const [mounted, setMounted] = useState(false);
  useBodyScrollLock(open);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!open) return null;

  const layer = (
    <Box
      role="dialog"
      aria-modal="true"
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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <ModalGlassShell
        sx={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          height: "auto",
          display: "flex",
          flexDirection: "column",
          p: 3,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          <Typography
            variant="mediumLarge"
            fontWeight={600}
            sx={{ color: theme.app.text.primary }}
          >
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close dialog"
            sx={modalCloseIconButtonSx(theme)}
          >
            <IconSlot slot={36} glyph="md">
              <CloseCircleIcon />
            </IconSlot>
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: "none",
            maxHeight: "calc(90vh - 220px)",
            overflowY: "auto",
            overflowX: "hidden",
            mb: 3,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {loading ? (
            <Skeleton variant="rounded" height={400} />
          ) : (
            <EmailPreviewFrame html={html} title="Preview" />
          )}
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          {footerActions}
        </Box>
      </ModalGlassShell>
    </Box>
  );

  if (typeof document === "undefined" || !mounted) {
    return null;
  }

  return createPortal(layer, document.body);
}
