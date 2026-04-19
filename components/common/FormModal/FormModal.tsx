"use client";

import type { ReactNode, RefObject } from "react";
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/lib/ui/useBodyScrollLock";
import { dialogBackdropBackground } from "@/lib/ui/dialogBackdrop";
import { FORM_MODAL_PORTAL_Z_INDEX } from "@/lib/ui/dialogStacking";
import Close from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography, Button } from "@/components/common";
import { ModalGlassShell } from "./ModalGlassShell";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { CloseCircleIcon } from "@/components/dashboard/icons/CloseCircleIcon";

export interface FormModalFieldConfig {
  id: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password";
}

export interface FormModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  onSave: () => void;
  primaryButtonLabel?: string;
  /** When true, the primary action button is non-interactive (e.g. while a mutation runs). */
  primaryButtonDisabled?: boolean;
  cancelButtonLabel?: string;
  /** When false, hides the cancel button entirely. Default: true */
  showCancelButton?: boolean;
  /** Primary action icon (e.g. sparkle) — uses shared gradient primary button. */
  primaryStartIcon?: ReactNode;
  /** Modal card max width (default 540). */
  maxWidth?: number | string;
  /** Close control: outline ring (default) or solid red circle with white ✕ (e.g. Edit IP Block). */
  closeButtonVariant?: "outline" | "filled";
  /**
   * When true, body height follows content (no flex stretch); scrolls only if content exceeds viewport.
   * Use for tall dynamic forms (e.g. Add Social Media) so the card does not leave empty vertical space.
   */
  fitContent?: boolean;
  /** Attach to the scrollable fields region (for `scrollIntoView` targeting). */
  fieldsScrollRef?: RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export function FormModal({
  open,
  title,
  description,
  onClose,
  onSave,
  primaryButtonLabel = "Save",
  primaryButtonDisabled = false,
  cancelButtonLabel = "Cancel",
  showCancelButton = true,
  primaryStartIcon,
  maxWidth = 540,
  fitContent = false,
  closeButtonVariant = "outline",
  fieldsScrollRef,
  children,
  sx,
}: FormModalProps) {
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
        /** Tint only here — blur on the same layer weakens inner `ModalGlassShell` backdrop-filter. */
        background: dialogBackdropBackground(theme),
        p: 2,
      }}
    >
      <ModalGlassShell
        sx={{
          width: "100%",
          maxWidth,
          maxHeight: "90vh",
          height: "auto",
          display: "flex",
          flexDirection: "column",
          p: 3,
          ...((sx as object) ?? {}),
        }}
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
          <Box>
            <Typography
              variant="mediumLarge"
              fontWeight={600}
              sx={{ color: theme.app.text.primary }}
            >
              {title}
            </Typography>
            {description && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color:
                    theme.palette.mode === "light"
                      ? theme.app.text.secondary
                      : theme.app.dashboard.white80,
                  fontSize: 14,
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close dialog"
            sx={
              closeButtonVariant === "filled"
                ? {
                    width: 35,
                    height: 35,
                    p: 0,
                    flexShrink: 0,
                    border: "none",
                    borderRadius: "50%",
                    bgcolor: theme.palette.error.main,
                    color: theme.palette.common.white,
                    "&:hover": {
                      bgcolor: theme.palette.error.dark,
                    },
                  }
                : {
                    width: 35,
                    height: 35,
                    p: 0,
                    flexShrink: 0,
                    border: `1px solid ${theme.app.dashboard.textMuted}`,
                    borderRadius: "50%",
                    color: theme.app.dashboard.textMuted95,
                    "&:hover": {
                      bgcolor: theme.palette.action.hover,
                      borderColor: theme.app.text.primary,
                      color: theme.app.text.primary,
                    },
                  }
            }
          >
            {closeButtonVariant === "filled" ? (
              <Close sx={{ fontSize: 18 }} />
            ) : (
              <CloseCircleIcon width={18} height={18} />
            )}
          </IconButton>
        </Box>

        <Box
          ref={fieldsScrollRef}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            mb: 3,
            overflowX: "hidden",
            ...(fitContent
              ? {
                  flex: "none",
                  maxHeight: "calc(90vh - 220px)",
                  overflowY: "auto",
                }
              : {
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                }),
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {children}
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          {showCancelButton && (
            <Button variant="secondary" onClick={onClose}>
              {cancelButtonLabel}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onSave}
            disabled={primaryButtonDisabled}
            sx={gradientPrimaryButtonSx}
            startIcon={primaryStartIcon}
          >
            {primaryButtonLabel}
          </Button>
        </Box>
      </ModalGlassShell>
    </Box>
  );

  if (typeof document === "undefined" || !mounted) {
    return null;
  }

  return createPortal(layer, document.body);
}

