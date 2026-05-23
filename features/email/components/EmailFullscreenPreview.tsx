"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import DesktopWindowsOutlined from "@mui/icons-material/DesktopWindowsOutlined";
import PhoneIphoneOutlined from "@mui/icons-material/PhoneIphoneOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { EmailPreviewFrame } from "./EmailPreviewFrame";

export function EmailFullscreenPreview({
  open,
  onClose,
  html,
  device,
  onDeviceChange,
  publishedLabel,
}: {
  open: boolean;
  onClose: () => void;
  html: string;
  device: "desktop" | "mobile";
  onDeviceChange: (device: "desktop" | "mobile") => void;
  publishedLabel?: string | null;
}) {
  const theme = useTheme() as AppTheme;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const previewWidth =
    device === "mobile" ? 390 : "min(920px, calc(100vw - 48px))";

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-label="Email preview"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1600,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0c1118",
        backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 0%, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 70%)`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: { xs: 2, md: 3 },
          py: 1.5,
          flexShrink: 0,
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          bgcolor: alpha("#0c1118", 0.98),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
          <VisibilityOutlined sx={{ color: theme.palette.primary.light, fontSize: 22 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="mediumLarge" fontWeight={700} color="white">
              Preview
            </Typography>
            <Typography variant="small" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
              Scroll page to see full email · Esc to close
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            p: 0.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.common.white, 0.06),
            border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
          }}
        >
          <Button
            type="button"
            variant={device === "desktop" ? "primary" : "secondary"}
            size="compact"
            startIcon={<DesktopWindowsOutlined />}
            onClick={() => onDeviceChange("desktop")}
          >
            Desktop
          </Button>
          <Button
            type="button"
            variant={device === "mobile" ? "primary" : "secondary"}
            size="compact"
            startIcon={<PhoneIphoneOutlined />}
            onClick={() => onDeviceChange("mobile")}
          >
            Mobile
          </Button>
        </Box>

        <IconButton
          aria-label="Close preview"
          onClick={onClose}
          sx={{
            color: theme.palette.common.white,
            bgcolor: alpha(theme.palette.common.white, 0.08),
            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            borderRadius: 1.5,
            "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.14) },
          }}
        >
          <CloseOutlined />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: { xs: 2, md: 3 },
          px: { xs: 1.5, md: 3 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: previewWidth,
            borderRadius: 2,
            overflow: "visible",
            boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.55)}`,
            border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
            flexShrink: 0,
          }}
        >
          <EmailPreviewFrame html={html} title="Email preview" fitToContent />
        </Box>
      </Box>

      {publishedLabel ? (
        <Typography
          variant="caption"
          sx={{
            flexShrink: 0,
            textAlign: "center",
            py: 1.25,
            color: alpha(theme.palette.common.white, 0.55),
            borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
          }}
        >
          {publishedLabel}
        </Typography>
      ) : null}
    </Box>
  );
}
