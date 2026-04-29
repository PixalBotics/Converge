"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ChatRounded from "@mui/icons-material/ChatRounded";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/components/dashboard/WidgetFlowShell";
import { buildWidgetScript, readWidgetDraft, saveWidgetDraft, type WidgetDraft } from "@/lib/chat-widget/widgetDraft";

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

  const chatScript = useMemo(() => buildWidgetScript(draft ?? readWidgetDraft()), [draft]);

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
        <Box sx={{ mt: 1, border: `1px solid ${theme.app.dashboard.cardBorder}`, borderRadius: 2.5, overflow: "hidden", bgcolor: "#EEF1F7" }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: draft.buttonColor, color: draft.textColor }}>
            <Typography variant="mediumLarge" sx={{ color: "inherit", textAlign: draft.headerTitleAlign === "Left" ? "left" : "center" }}>
              {draft.headerTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: "inherit", opacity: 0.9, textAlign: draft.headerTitleAlign === "Left" ? "left" : "center" }}>
              Online now
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, display: "grid", gap: 1 }}>
            <Box sx={{ bgcolor: "#DDE3EC", borderRadius: 2, p: 1.2 }}>
              <Typography variant="body2" sx={{ color: "#1B2A3D" }}>
                {draft.greetingMessage}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 2, px: 1.2, py: 0.9 }}>
              <ChatRounded sx={{ color: draft.buttonColor, fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: "#5B6B82", flex: 1 }}>
                {draft.sendPlaceholder}
              </Typography>
              <Typography variant="body2" sx={{ color: "#0F172A", fontWeight: 600 }}>
                {draft.startChatLabel}
              </Typography>
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
