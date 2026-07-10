"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { IconSlot, Typography } from "@/components/common";
import { modalCloseIconButtonSx } from "@/lib/design-system";
import { useBodyScrollLock } from "@/lib/ui/useBodyScrollLock";
import { dialogBackdropBackground } from "@/lib/ui/dialogBackdrop";
import { FORM_MODAL_PORTAL_Z_INDEX } from "@/lib/ui/dialogStacking";
import { ModalGlassShell } from "@/components/common/FormModal/ModalGlassShell";
import { CloseCircleIcon } from "@/components/common/icons";

type Props = {
  open: boolean;
  title: string;
  maxWidth?: number | string;
  onClose: () => void;
  children: React.ReactNode;
};

export function ServicesDialogShell({
  open,
  title,
  maxWidth = 720,
  onClose,
  children,
}: Props) {
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
    >
      <ModalGlassShell
        sx={{
          width: "100%",
          maxWidth,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          p: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2, gap: 2 }}>
          <Typography variant="mediumLarge" fontWeight={600} sx={{ color: theme.app.text.primary }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="Close" sx={modalCloseIconButtonSx(theme)}>
            <IconSlot slot={36} glyph="md">
              <CloseCircleIcon />
            </IconSlot>
          </IconButton>
        </Box>
        <Box
          sx={{
            overflowY: "auto",
            flex: 1,
            minHeight: 0,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {children}
        </Box>
      </ModalGlassShell>
    </Box>
  );

  if (typeof document === "undefined" || !mounted) return null;
  return createPortal(layer, document.body);
}
