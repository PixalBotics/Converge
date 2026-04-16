"use client";

import type { ReactNode } from "react";
import { useBodyScrollLock } from "@/lib/ui/useBodyScrollLock";
import Close from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography, Button } from "@/components/common";
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
  cancelButtonLabel = "Cancel",
  showCancelButton = true,
  primaryStartIcon,
  maxWidth = 540,
  fitContent = false,
  closeButtonVariant = "outline",
  children,
  sx,
}: FormModalProps) {
  const theme = useTheme() as AppTheme;
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: theme.app.dashboard.backdropDark,
        p: 2,
      }}
    >
      <DashboardCard
        sx={{
          position: "relative",
          width: "100%",
          maxWidth,
          maxHeight: "90vh",
          height: "auto",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          p: 3,
          background: theme.appBackground,
          borderRadius: 3,
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
            sx={gradientPrimaryButtonSx}
            startIcon={primaryStartIcon}
          >
            {primaryButtonLabel}
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}

