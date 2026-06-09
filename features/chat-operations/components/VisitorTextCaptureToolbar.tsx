"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import AlternateEmailOutlined from "@mui/icons-material/AlternateEmailOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { VisitorProfileField } from "@/services/chat/visitor-profile.types";

export interface VisitorTextCaptureAnchor {
  x: number;
  y: number;
}

interface VisitorTextCaptureToolbarProps {
  anchor: VisitorTextCaptureAnchor;
  selectedText: string;
  busy?: boolean;
  onSelectField: (field: VisitorProfileField) => void;
  onDismiss: () => void;
}

const ACTIONS: Array<{
  field: VisitorProfileField;
  label: string;
  icon: typeof BadgeOutlined;
}> = [
  { field: "name", label: "Set name", icon: BadgeOutlined },
  { field: "email", label: "Set email", icon: AlternateEmailOutlined },
  { field: "phone", label: "Set phone", icon: PhoneOutlined },
];

export function VisitorTextCaptureToolbar({
  anchor,
  selectedText,
  busy = false,
  onSelectField,
  onDismiss,
}: VisitorTextCaptureToolbarProps) {
  const theme = useTheme() as AppTheme;

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-visitor-capture-toolbar]")) return;
      onDismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onDismiss]);

  if (typeof document === "undefined") return null;

  const preview =
    selectedText.length > 48 ? `${selectedText.slice(0, 45).trim()}…` : selectedText;

  return createPortal(
    <Paper
      data-visitor-capture-toolbar
      elevation={8}
      sx={{
        position: "fixed",
        left: anchor.x,
        top: anchor.y,
        transform: "translate(-50%, calc(-100% - 8px))",
        zIndex: theme.zIndex.modal + 2,
        minWidth: 220,
        maxWidth: 320,
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.9)}`,
        bgcolor: theme.app.dashboard.menuSurfaceBg,
        boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.28)}`,
      }}
    >
      <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.7)}` }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: theme.app.dashboard.textMuted,
            fontWeight: 600,
            letterSpacing: 0.2,
            textTransform: "uppercase",
            fontSize: 10,
          }}
        >
          Save to visitor profile
        </Typography>
        <Typography
          variant="small"
          sx={{
            display: "block",
            mt: 0.35,
            color: theme.app.text.primary,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          “{preview}”
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", py: 0.5 }}>
        {ACTIONS.map(({ field, label, icon: Icon }) => (
          <Box
            key={field}
            component="button"
            type="button"
            disabled={busy}
            onClick={() => onSelectField(field)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
              border: 0,
              background: "transparent",
              cursor: busy ? "not-allowed" : "pointer",
              px: 1.5,
              py: 1,
              textAlign: "left",
              color: theme.app.text.primary,
              opacity: busy ? 0.6 : 1,
              "&:hover": busy
                ? undefined
                : {
                    bgcolor: alpha(theme.app.dashboard.accentCyan, 0.1),
                  },
            }}
          >
            <Icon sx={{ fontSize: 18, color: theme.app.dashboard.accentCyan }} />
            <Typography variant="small" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>,
    document.body,
  );
}
