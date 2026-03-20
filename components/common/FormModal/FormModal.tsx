"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { DashboardCard, Typography, Button } from "@/components/common";
import { CloseCircleIcon } from "@/components/dashboard/icons/CloseCircleIcon";

const defaultModalBackground =
  "radial-gradient(50% 50% at 50% 50%, #09013F 0%, #00011A 100%)";

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
  children,
  sx,
}: FormModalProps) {
  const theme = useTheme();
  const modalBackground =
    (theme as Theme & { appBackground?: string }).appBackground ?? defaultModalBackground;

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
        bgcolor: "rgba(0,0,0,0.55)",
        p: 2,
      }}
    >
      <DashboardCard
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          height: "auto",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          p: 3,
          background: modalBackground,
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
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              {title}
            </Typography>
            {description && (
              <Typography
                variant="body2"
                sx={{ mt: 0.5, color: "rgba(148,163,184,0.9)", fontSize: 14 }}
              >
                {description}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              width: 43,
              height: 43,
              p: 0,
            }}
          >
            <CloseCircleIcon width={43} height={43} />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            mb: 3,
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
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              minWidth: 120,
              borderRadius: "9999px",
              px: 3,
              bgcolor: "rgba(15,23,42,0.9)",
            }}
          >
            {cancelButtonLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            sx={{
              minWidth: 140,
              borderRadius: "9999px",
              px: 3.25,
            }}
          >
            {primaryButtonLabel}
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}

