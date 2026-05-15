"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";

const TEXT_SCRIPT = `<script src=\"https://widget.company.com/text-widget.js\" data-id=\"12345\" defer></script>`;

export default function TextWidgetScriptPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(TEXT_SCRIPT);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <WidgetFlowShell
      pageTitle="Text Us Widget Script"
      subtitle="Connect your workflow with industry-leading CRM platform minutes."
      cardTitle="Your Text Widget is Ready"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>Preview Widget</Button>
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
    </WidgetFlowShell>
  );
}
