"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import FullscreenOutlined from "@mui/icons-material/FullscreenOutlined";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import RocketLaunchOutlined from "@mui/icons-material/RocketLaunchOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";

export function EmailDesignBuilderShell({
  backLabel,
  onBack,
  title,
  subtitle,
  statusChip,
  dirty,
  saving,
  publishing,
  canSave,
  canPublish,
  onSave,
  onPublish,
  onVersions,
  onFullscreenPreview,
  toolsOpen,
  onToggleTools,
  children,
}: {
  backLabel: string;
  onBack: () => void;
  title: string;
  subtitle?: string;
  statusChip?: ReactNode;
  dirty: boolean;
  saving?: boolean;
  publishing?: boolean;
  canSave: boolean;
  canPublish: boolean;
  onSave: () => void;
  onPublish: () => void;
  onVersions: () => void;
  onFullscreenPreview: () => void;
  toolsOpen?: boolean;
  onToggleTools?: () => void;
  children: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minHeight: 0,
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          mb: 2,
          borderRadius: 2.5,
          border: `1px solid ${d.cardBorder}`,
          bgcolor: alpha(d.cardBg ?? theme.palette.background.paper, 0.92),
          backdropFilter: d.cardBackdropBlur ?? "blur(12px)",
          boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.18)}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.5,
            px: { xs: 2, md: 2.5 },
            py: 1.5,
          }}
        >
          <Button
            type="button"
            variant="secondary"
            size="compact"
            startIcon={<ArrowBackOutlined />}
            onClick={onBack}
          >
            {backLabel}
          </Button>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", sm: "block" }, borderColor: alpha(d.cardBorder, 0.8) }}
          />

          <Box sx={{ flex: "1 1 180px", minWidth: 0 }}>
            <Typography variant="mediumLarge" fontWeight={700} color="white">
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="small" sx={{ color: d.textMuted, mt: 0.25 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
            {statusChip}
            <Chip
              size="small"
              color={dirty ? "warning" : "default"}
              label={dirty ? "Unsaved" : "Saved"}
              variant="outlined"
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: alpha(d.cardBorder, 0.7) }} />

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            px: { xs: 2, md: 2.5 },
            py: 1.25,
            justifyContent: { xs: "stretch", sm: "flex-end" },
          }}
        >
          {onToggleTools ? (
            <Button
              type="button"
              variant={toolsOpen ? "primary" : "secondary"}
              size="compact"
              startIcon={<TuneOutlined />}
              onClick={onToggleTools}
            >
              {toolsOpen ? "Hide tools" : "Show tools"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="compact"
            startIcon={<FullscreenOutlined />}
            onClick={onFullscreenPreview}
          >
            Expand
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="compact"
            startIcon={<HistoryOutlined />}
            onClick={onVersions}
          >
            Versions
          </Button>
          {canSave ? (
            <Button
              type="button"
              variant="secondary"
              size="compact"
              startIcon={<SaveOutlined />}
              disabled={saving}
              onClick={onSave}
            >
              {saving ? "Saving…" : "Save draft"}
            </Button>
          ) : null}
          {canPublish ? (
            <Button
              type="button"
              variant="primary"
              size="compact"
              startIcon={<RocketLaunchOutlined />}
              sx={{ ...gradientPrimaryButtonSx, flex: { xs: "1 1 auto", sm: "0 0 auto" } }}
              disabled={publishing}
              onClick={onPublish}
            >
              {publishing ? "Publishing…" : "Publish"}
            </Button>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", height: { xs: "min(70vh, 680px)", md: "min(78vh, 760px)" } }}>
        {children}
      </Box>
    </Box>
  );
}
