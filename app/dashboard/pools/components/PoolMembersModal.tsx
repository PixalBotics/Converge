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
import { PoolMembersPanel, type PoolMembersPanelPool } from "./PoolMembersPanel";

export type PoolMembersModalProps = {
  open: boolean;
  onClose: () => void;
  pool: PoolMembersPanelPool | null;
  canAdd: boolean;
  canMove: boolean;
  canRemove: boolean;
};

export function PoolMembersModal({ open, onClose, pool, canAdd, canMove, canRemove }: PoolMembersModalProps) {
  const theme = useTheme() as AppTheme;
  const [mounted, setMounted] = useState(false);

  useBodyScrollLock(open);
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !pool) return null;

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
          maxWidth: 920,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          p: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2, gap: 2 }}>
          <Box>
            <Typography variant="mediumLarge" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              Pool members
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
              {pool.poolName}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: theme.app.dashboard.textMuted }}>
              Pool member APIs require page:hrms and the matching operational permission (add / update / remove).
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close"
            sx={modalCloseIconButtonSx(theme)}
          >
            <IconSlot slot={36} glyph="md">
              <CloseCircleIcon />
            </IconSlot>
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          <PoolMembersPanel
            pool={pool}
            active={open}
            canAdd={canAdd}
            canMove={canMove}
            canRemove={canRemove}
            memberActionsVariant="move-remove"
          />
        </Box>
      </ModalGlassShell>
    </Box>
  );

  if (typeof document === "undefined" || !mounted) return null;
  return createPortal(layer, document.body);
}
