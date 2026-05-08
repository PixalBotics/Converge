"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatRounded from "@mui/icons-material/ChatRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import ContentCopy from "@mui/icons-material/ContentCopy";
import SendRounded from "@mui/icons-material/SendRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/components/dashboard/WidgetFlowShell";

const TEXT_SCRIPT = `<script src=\"https://widget.company.com/text-widget.js\" data-id=\"12345\" defer></script>`;
const TEXT_WIDGET_ENABLED_KEY = "text_widget_enabled_v1";

export default function TextWidgetScriptPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const previewPanelHeight = 360;
  const previewPanelWidth = 320;
  const previewInsetBottomPx = 16;
  const previewSandboxMinHeight = previewInsetBottomPx + previewPanelHeight + 24;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(TEXT_SCRIPT);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TEXT_WIDGET_ENABLED_KEY, "1");
  }, []);

  return (
    <WidgetFlowShell
      pageTitle="Text Us Widget Script"
      subtitle="Connect your workflow with industry-leading CRM platform minutes."
      cardTitle="Your Text Widget is Ready"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => setShowPreview((prev) => !prev)}>
            Preview Widget
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={handleCopy} startIcon={<ContentCopy sx={{ fontSize: 16 }} />}>
            {copied ? "Copied" : "Copy Script"}
          </Button>
        </>
      }
    >
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.2 }}>Embed Code</Typography>
      <Box sx={{ border: `1px solid ${theme.app.dashboard.cardBorder}`, borderRadius: 1.5, p: 1.5, bgcolor: theme.app.dashboard.overlayLight }}>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, wordBreak: "break-all" }}>{TEXT_SCRIPT}</Typography>
      </Box>
      {showPreview ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 1 }}>
            Live preview
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.25 }}>
            Preview is anchored to the bottom of this frame (inside the card only), not fullscreen.
          </Typography>
          <Box
            sx={{
              position: "relative",
              borderRadius: 2.5,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              bgcolor: "#E5EAF2",
              minHeight: previewSandboxMinHeight,
              overflow: "hidden",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            <Box
              role="region"
              aria-label="Text widget preview"
              sx={{
                position: "absolute",
                bottom: previewInsetBottomPx,
                left: "50%",
                transform: "translateX(-50%)",
                width: `${previewPanelWidth}px`,
                height: `${previewPanelHeight}px`,
                maxWidth: "calc(100% - 16px)",
                borderRadius: 2.5,
                overflow: "hidden",
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
                bgcolor: "#EEF1F7",
                boxShadow: "0 14px 32px rgba(3, 12, 37, 0.28)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ px: 2, py: 1.5, bgcolor: "#da9b2f", color: "#FFFFFF", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="mediumLarge" sx={{ color: "inherit" }}>
                    Special Offer
                  </Typography>
                  <Typography variant="body2" sx={{ color: "inherit", opacity: 0.92 }}>
                    Get 20% off all premium plans today.
                  </Typography>
                </Box>
                <IconButton
                  type="button"
                  size="small"
                  aria-label="Close preview"
                  onClick={() => setShowPreview(false)}
                  sx={{
                    color: "inherit",
                    mt: -0.4,
                    mr: -0.6,
                    opacity: 0.92,
                    "&:hover": { opacity: 1, bgcolor: "rgba(0,0,0,0.12)" },
                  }}
                >
                  <CloseRounded sx={{ fontSize: 22 }} />
                </IconButton>
              </Box>
              <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1, flex: 1, minHeight: 0, overflow: "hidden" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                  <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 1.25, px: 1.2, py: 0.9 }}>
                    <Typography variant="body2" sx={{ color: "#5B6B82" }}>Name</Typography>
                  </Box>
                  <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 1.25, px: 1.2, py: 0.9 }}>
                    <Typography variant="body2" sx={{ color: "#5B6B82" }}>Email</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                  <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 1.25, px: 1.2, py: 0.9 }}>
                    <Typography variant="body2" sx={{ color: "#5B6B82" }}>Message</Typography>
                  </Box>
                  <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 1.25, px: 1.2, py: 0.9 }}>
                    <Typography variant="body2" sx={{ color: "#5B6B82" }}>Phone Number</Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: "auto", display: "flex", alignItems: "center", gap: 1, bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: "22px", px: 1.2, py: 0.75 }}>
                  <ChatRounded sx={{ color: "#da9b2f", fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: "#5B6B82", flex: 1 }}>
                    Enter message...
                  </Typography>
                  <IconButton
                    type="button"
                    aria-label="Send message"
                    size="small"
                    tabIndex={-1}
                    disableRipple
                    sx={{
                      bgcolor: "#da9b2f",
                      color: "#FFFFFF",
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      "&:hover": { bgcolor: "#da9b2f", filter: "brightness(1.06)" },
                    }}
                  >
                    <SendRounded sx={{ fontSize: 22 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : null}
    </WidgetFlowShell>
  );
}
