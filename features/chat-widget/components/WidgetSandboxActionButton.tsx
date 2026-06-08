"use client";

import { useState } from "react";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import ScienceRounded from "@mui/icons-material/ScienceRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import { publishAppToast } from "@/lib/notify";
import { useWidgetPreviewShareLink } from "../hooks/useWidgetPreviewShareLink";

const sandboxGradientSx = {
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
  color: "#fff",
  fontWeight: 700,
  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.45)",
  "&:hover": {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)",
    boxShadow: "0 6px 20px rgba(99, 102, 241, 0.55)",
  },
};

export function WidgetSandboxActionButton({
  widgetKey,
  variant = "table",
  size = "small",
}: {
  widgetKey: string;
  /** `table` — compact icon; `button` — full gradient CTA */
  variant?: "table" | "button";
  size?: "small" | "medium";
}) {
  const theme = useTheme() as AppTheme;
  const { publicTestUrl, loading, previewShareToken, refresh } =
    useWidgetPreviewShareLink(widgetKey);
  const [copyBusy, setCopyBusy] = useState(false);

  const key = widgetKey.trim();
  if (!key.startsWith("wgt_")) return null;

  const openTest = () => {
    if (publicTestUrl) {
      window.open(publicTestUrl, "_blank", "noopener,noreferrer");
      return;
    }
    void refresh().then((link) => {
      const url =
        link?.publicTestUrl?.trim() ||
        (link?.previewShareToken
          ? `${window.location.origin}/test/widget?widgetKey=${encodeURIComponent(key)}&token=${encodeURIComponent(link.previewShareToken)}`
          : "");
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else publishAppToast({ variant: "error", message: "Could not open test link" });
    });
  };

  const copyLink = async () => {
    setCopyBusy(true);
    try {
      let url = publicTestUrl;
      if (!url) {
        const link = await refresh();
        url = link?.publicTestUrl?.trim() || "";
      }
      if (!url) {
        publishAppToast({ variant: "error", message: "Test link not ready yet" });
        return;
      }
      await navigator.clipboard.writeText(url);
      publishAppToast({
        variant: "success",
        message: "Public test link copied — share with anyone",
      });
    } catch {
      publishAppToast({ variant: "error", message: "Could not copy link" });
    } finally {
      setCopyBusy(false);
    }
  };

  if (variant === "table") {
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}>
        <Tooltip title="Open public test page" arrow>
          <span>
            <IconButton
              size={size}
              onClick={openTest}
              disabled={loading && !previewShareToken}
              aria-label={`Test widget ${key}`}
              sx={{
                background: sandboxGradientSx.background,
                color: "#fff",
                width: 32,
                height: 32,
                boxShadow: sandboxGradientSx.boxShadow,
                "&:hover": {
                  background: sandboxGradientSx["&:hover"].background,
                },
                "&.Mui-disabled": {
                  bgcolor: alpha(theme.palette.primary.main, 0.35),
                  color: alpha("#fff", 0.7),
                },
              }}
            >
              {loading && !previewShareToken ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                <ScienceRounded sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Copy public test link" arrow>
          <span>
            <IconButton
              size={size}
              onClick={() => void copyLink()}
              disabled={copyBusy || (loading && !publicTestUrl)}
              aria-label={`Copy test link for ${key}`}
              sx={{
                color: theme.app.dashboard.white80,
                width: 28,
                height: 28,
              }}
            >
              {copyBusy ? (
                <CircularProgress size={14} />
              ) : (
                <ContentCopyRounded sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      <Button
        size={size}
        startIcon={
          loading && !previewShareToken ? (
            <CircularProgress size={16} sx={{ color: "#fff" }} />
          ) : (
            <OpenInNewRounded />
          )
        }
        onClick={openTest}
        disabled={loading && !previewShareToken}
        sx={mergeSx(gradientPrimaryButtonSx, sandboxGradientSx)}
      >
        Open test page
      </Button>
      <Button
        size={size}
        variant="outlined"
        startIcon={copyBusy ? <CircularProgress size={16} /> : <ContentCopyRounded />}
        onClick={() => void copyLink()}
        disabled={copyBusy}
        sx={{
          borderColor: alpha(theme.palette.primary.main, 0.5),
          color: theme.app.dashboard.textPrimary,
        }}
      >
        Copy public link
      </Button>
    </Box>
  );
}
