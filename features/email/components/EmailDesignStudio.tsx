"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import DesktopWindowsOutlined from "@mui/icons-material/DesktopWindowsOutlined";
import FullscreenOutlined from "@mui/icons-material/FullscreenOutlined";
import PhoneIphoneOutlined from "@mui/icons-material/PhoneIphoneOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { EmailPreviewFrame } from "./EmailPreviewFrame";
import {
  EmailBuilderStudioCanvas,
  EmailBuilderStudioRoot,
  EmailBuilderStudioTools,
} from "../styles/email-design.styled";

/** Tab rail (76px) + tools body; single-column fields need ~300px+ body width. */
const TOOLS_WIDTH = 460;

export function EmailDesignStudio({
  toolsOpen,
  onToggleTools,
  loading,
  previewHtml,
  device,
  onDeviceChange,
  onFullscreenPreview,
  publishedLabel,
  children,
}: {
  toolsOpen: boolean;
  onToggleTools: () => void;
  loading?: boolean;
  previewHtml: string;
  device: "desktop" | "mobile";
  onDeviceChange: (d: "desktop" | "mobile") => void;
  onFullscreenPreview: () => void;
  publishedLabel?: string | null;
  children: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const previewMax = device === "mobile" ? 390 : "min(820px, 100%)";
  const skeletonBg = alpha(d.cardBg ?? theme.palette.background.paper, 0.35);

  return (
    <EmailBuilderStudioRoot sx={{ flex: 1, minHeight: 0 }}>
      <EmailBuilderStudioTools
        sx={{
          width: toolsOpen ? { xs: "100%", md: TOOLS_WIDTH } : 0,
          minWidth: toolsOpen ? { xs: "100%", md: TOOLS_WIDTH } : 0,
          maxHeight: "100%",
          alignSelf: "stretch",
          opacity: toolsOpen ? 1 : 0,
          pointerEvents: toolsOpen ? "auto" : "none",
          position: { xs: toolsOpen ? "absolute" : "absolute", md: "relative" },
          zIndex: { xs: 25, md: 1 },
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: {
            xs: toolsOpen ? `8px 0 32px ${alpha(theme.palette.common.black, 0.35)}` : "none",
            md: "none",
          },
        }}
      >
        {loading ? (
          <Skeleton
            variant="rounded"
            height="100%"
            sx={{ m: 2, minHeight: 400, bgcolor: skeletonBg }}
          />
        ) : (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              height: "100%",
              maxHeight: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            {children}
          </Box>
        )}
      </EmailBuilderStudioTools>

      {toolsOpen && !loading ? (
        <Box
          role="presentation"
          sx={{
            display: { xs: "block", md: "none" },
            position: "absolute",
            inset: 0,
            zIndex: 20,
            bgcolor: alpha(theme.palette.common.black, 0.45),
          }}
          onClick={onToggleTools}
        />
      ) : null}

      <EmailBuilderStudioCanvas>
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: 2,
            py: 1.25,
            borderBottom: `1px solid ${alpha(d.cardBorder, 0.9)}`,
            bgcolor: alpha(d.cardBg ?? theme.palette.background.paper, 0.6),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              aria-label={toolsOpen ? "Hide design tools" : "Show design tools"}
              onClick={onToggleTools}
              sx={{
                color: theme.palette.common.white,
                border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
                borderRadius: 1.5,
              }}
            >
              {toolsOpen ? <ChevronLeftOutlined /> : <TuneOutlined />}
            </IconButton>
            <Box>
              <Typography variant="small" fontWeight={700} color="white">
                Live canvas
              </Typography>
              <Typography variant="caption" sx={{ color: d.textMuted }}>
                Updates as you edit
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
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
            <IconButton
              aria-label="Fullscreen preview"
              onClick={onFullscreenPreview}
              size="small"
              sx={{ color: d.textMuted, border: `1px solid ${alpha(d.cardBorder, 0.8)}` }}
            >
              <FullscreenOutlined fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            p: { xs: 2, md: 3 },
            bgcolor: alpha(theme.palette.common.black, 0.2),
            backgroundImage: `radial-gradient(circle at 50% 0%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 55%)`,
          }}
        >
          {loading ? (
            <Skeleton
              variant="rounded"
              width={previewMax}
              height={480}
              sx={{ maxWidth: "100%", bgcolor: skeletonBg }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                maxWidth: previewMax,
                borderRadius: 2,
                overflow: "visible",
                boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.35)}`,
                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                transition: "max-width 0.25s ease",
              }}
            >
              <EmailPreviewFrame html={previewHtml} title="Live email canvas" fitToContent />
            </Box>
          )}
        </Box>

        {publishedLabel ? (
          <Typography
            variant="caption"
            sx={{
              flexShrink: 0,
              textAlign: "center",
              py: 1,
              color: d.textMuted,
              borderTop: `1px solid ${alpha(d.cardBorder, 0.6)}`,
            }}
          >
            {publishedLabel}
          </Typography>
        ) : null}
      </EmailBuilderStudioCanvas>

      {!toolsOpen ? (
        <IconButton
          aria-label="Open design tools"
          onClick={onToggleTools}
          sx={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 15,
            display: { xs: "flex", md: "flex" },
            bgcolor: alpha(d.cardBg ?? theme.palette.background.paper, 0.95),
            color: theme.palette.primary.light,
            border: `1px solid ${d.cardBorder}`,
            boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.25)}`,
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
          }}
        >
          <ChevronRightOutlined />
        </IconButton>
      ) : null}
    </EmailBuilderStudioRoot>
  );
}
