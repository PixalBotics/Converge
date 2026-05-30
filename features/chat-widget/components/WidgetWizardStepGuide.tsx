"use client";

import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { distributionWizardDraftNoticeSx } from "@/app/dashboard/distribution-setup/wizard.styles";

export type WidgetWizardGuideStep = "button" | "box" | "notifications";

const COPY: Record<
  WidgetWizardGuideStep,
  { title: string; lines: string[] }
> = {
  button: {
    title: "Launcher (closed widget on your site)",
    lines: [
      "Invitation bubble — short text above the chat button before open.",
      "Secondary button — one optional link (e.g. WhatsApp); must be a single https URL.",
      "Colors & icon — how the floating button looks on the customer website.",
    ],
  },
  box: {
    title: "Chat panel (after visitor opens the widget)",
    lines: [
      "Header title — top bar text inside the open panel.",
      "Panel greeting — intro screen with Continue (optional).",
      "Chat welcome — first message bubble in the conversation.",
      "Composer hint — gray placeholder in the message box (one field).",
      "Inquiry topics — pills visitors pick before chat (saved on this step).",
    ],
  },
  notifications: {
    title: "Routing, forms & alerts",
    lines: [
      "Chat mode — AI only, agents only, or Hybrid (AI then Talk to agent).",
      "Allowed domains — where the embed may load (hostnames only, not full URLs).",
      "Pre-chat form — name/email before chat starts.",
      "Publish on Install — live sites use the last published version.",
    ],
  },
};

export function WidgetWizardStepGuide({ step }: { step: WidgetWizardGuideStep }) {
  const theme = useTheme() as AppTheme;
  const block = COPY[step];
  return (
    <Box sx={{ ...distributionWizardDraftNoticeSx, mb: 2 }}>
      <InfoOutlined sx={{ fontSize: 20, mt: 0.15, flexShrink: 0 }} />
      <Box component="span">
        <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
          {block.title}
        </Typography>
        <Typography
          variant="caption"
          component="ul"
          sx={{
            color: theme.app.dashboard.textMuted,
            lineHeight: 1.5,
            m: 0,
            pl: 2,
          }}
        >
          {block.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </Typography>
      </Box>
    </Box>
  );
}
