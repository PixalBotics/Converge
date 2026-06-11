"use client";

import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { distributionWizardDraftNoticeSx } from "@/app/dashboard/distribution-setup/wizard.styles";

/** Short SaaS copy for confusing duplicate fields on the chat box step. */
export function WidgetWizardFieldGuide() {
  const theme = useTheme() as AppTheme;
  return (
    <Box sx={{ ...distributionWizardDraftNoticeSx, mb: 2 }}>
      <InfoOutlined sx={{ fontSize: 20, mt: 0.15, flexShrink: 0 }} />
      <Box component="span">
        <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
          Copy fields (what visitors see)
        </Typography>
        <Typography variant="caption" component="div" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
          <strong>Invitation bubble</strong> — master switch on Button step; optional avatar + WhatsApp button.
          <br />
          <strong>Panel greeting</strong> — shown after open with a Continue button.
          <br />
          <strong>Chat welcome</strong> — first agent bubble inside the chat transcript.
          <br />
          <strong>Send placeholder</strong> — composer hint when the panel is open.
          <br />
          <strong>Inquiry topics</strong> — Chat box step; Notifications controls require/skip and alerts.
        </Typography>
      </Box>
    </Box>
  );
}
