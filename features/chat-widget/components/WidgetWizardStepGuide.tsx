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
      "Shape, colors, icon, and screen position for the floating chat button.",
      "Invitation bubble — optional callout above the button while chat is closed.",
      "WhatsApp button — optional second action inside the invitation bubble.",
      "Live message preview — shows agent replies above the launcher when chat is closed.",
      "Typography and panel theme are on Chat Box Design (step 2).",
    ],
  },
  box: {
    title: "Chat panel (after visitor opens the widget)",
    lines: [
      "Message flow — panel greeting (Continue), then first chat bubble, then composer.",
      "Banner & video welcome — promo image/video at the top of the panel.",
      "Brand theme — fonts, spacing, and color tokens for the open panel.",
    ],
  },
  notifications: {
    title: "Routing, forms & alerts",
    lines: [
      "Chat mode — AI only, agents only, or Hybrid (AI then Talk to agent).",
      "Allowed domains — where the embed may load (hostnames only, not full URLs).",
      "Inquiry topic pills — optional routing on the pre-chat form.",
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
