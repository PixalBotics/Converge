"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatRounded from "@mui/icons-material/ChatRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/components/dashboard/WidgetFlowShell";
import { LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import { buildWidgetScript, readWidgetDraft, saveWidgetDraft, type WidgetDraft } from "@/lib/chat-widget/widgetDraft";

function launcherSandboxHorizontalSx(position: WidgetDraft["buttonPosition"], sidePx: number): Record<string, string | number> {
  if (position === "left") return { left: sidePx, right: "auto", transform: "none" };
  if (position === "right") return { right: sidePx, left: "auto", transform: "none" };
  return { left: "50%", right: "auto", transform: `translateX(calc(-50% + ${sidePx}px))` };
}

export default function ChatWidgetScriptPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draft, setDraft] = useState<WidgetDraft | null>(null);

  useEffect(() => {
    const current = readWidgetDraft();
    const ensuredId = current.widgetId || String(Date.now());
    const next = { ...current, type: "chat" as const, widgetId: ensuredId, completed: true };
    saveWidgetDraft(next);
    setDraft(next);
  }, []);

  const [chatScript, setChatScript] = useState("");

  useEffect(() => {
    const d = draft ?? readWidgetDraft();
    setChatScript(buildWidgetScript(d, { scriptOrigin: window.location.origin }));
  }, [draft]);

  const previewPanelHeight = draft ? Math.max(320, Math.min(640, draft.boxHeight)) : 400;
  const previewPanelWidth = draft ? Math.max(280, Math.min(520, draft.boxWidth)) : 320;
  const previewSandboxMinHeight = draft
    ? Math.max(320, draft.launcherInsetBottomPx + previewPanelHeight + 24)
    : 400;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(chatScript);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <WidgetFlowShell
      pageTitle="Widget Script"
      subtitle="Paste this script on your website to activate the widget"
      cardTitle="Widget Script"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => setShowPreview((prev) => !prev)}>Preview Widget</Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={handleCopy} startIcon={<ContentCopy sx={{ fontSize: 16 }} />}>
            {copied ? "Copied" : "Copy Script"}
          </Button>
        </>
      }
    >
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.2 }}>Embed Code</Typography>
      <Box
        sx={{
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          borderRadius: 2,
          p: 1.5,
          bgcolor: theme.app.dashboard.overlayLight,
        }}
      >
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, wordBreak: "break-all" }}>{chatScript}</Typography>
      </Box>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
        Widget completed. Dashboard page par corner icon auto-show hoga.
      </Typography>

      {showPreview && draft ? (
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
              aria-label="Chat widget preview"
              sx={{
                position: "absolute",
                ...launcherSandboxHorizontalSx(draft.buttonPosition, draft.launcherInsetSidePx),
                bottom: draft.launcherInsetBottomPx,
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
            <Box sx={{ px: 2, py: 1.5, bgcolor: draft.buttonColor, color: draft.textColor, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="mediumLarge" sx={{ color: "inherit", textAlign: draft.headerTitleAlign === "Left" ? "left" : "center" }}>
                  {draft.headerTitle}
                </Typography>
                <Typography variant="body2" sx={{ color: "inherit", opacity: 0.9, textAlign: draft.headerTitleAlign === "Left" ? "left" : "center" }}>
                  Online now
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
              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <Box sx={{ bgcolor: "#DDE3EC", borderRadius: 2, p: 1.2 }}>
                  <Typography variant="body2" sx={{ color: "#1B2A3D" }}>
                    {draft.greetingMessage}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: "22px", px: 1.2, py: 0.75, flexShrink: 0 }}>
                {draft.iconDataUrl ? (
                  <Box component="img" src={draft.iconDataUrl} alt="" sx={{ width: 20, height: 20, objectFit: "contain" }} />
                ) : draft.launcherIconPreset ? (
                  <LauncherPresetIcon presetId={draft.launcherIconPreset} color={draft.iconColor} fontSizePx={20} />
                ) : (
                  <ChatRounded sx={{ color: draft.iconColor, fontSize: 20 }} />
                )}
                <Typography variant="body2" sx={{ color: "#5B6B82", flex: 1 }}>
                  {draft.sendPlaceholder}
                </Typography>
                <IconButton
                  type="button"
                  aria-label="Send message"
                  size="small"
                  tabIndex={-1}
                  disableRipple
                  sx={{
                    bgcolor: draft.buttonColor,
                    color: "#FFFFFF",
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    "&:hover": { bgcolor: draft.buttonHoverColor || draft.buttonColor, filter: "brightness(1.06)" },
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

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
          Go to Widget Dashboard
        </Button>
      </Box>
    </WidgetFlowShell>
  );
}
