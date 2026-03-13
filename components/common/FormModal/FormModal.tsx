"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import type { SxProps, Theme } from "@mui/material/styles";
import { Close as CloseIcon } from "@mui/icons-material";
import { DashboardCard, Typography, Button, InputField } from "@/components/common";

export interface FormModalFieldConfig {
  id: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password";
}

export interface FormModalProps {
  open: boolean;
  title: string;
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
  onClose,
  onSave,
  primaryButtonLabel = "Save",
  cancelButtonLabel = "Cancel",
  children,
  sx,
}: FormModalProps) {
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
          height: "auto",
          maxHeight: "90vh",
          overflowY: "auto",
          p: 3,
          background: "#020617",
          borderRadius: 3,
          ...((sx as object) ?? {}),
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              width: 32,
              height: 32,
              borderRadius: "9999px",
              border: "1px solid rgba(248,113,113,0.35)",
              bgcolor: "rgba(15,23,42,0.8)",
              color: "#F87171",
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 3 }}>
          {children}
        </Box>

        <Box
          sx={{
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

