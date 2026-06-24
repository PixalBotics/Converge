"use client";

import Box from "@mui/material/Box";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { CrmSetupGuideStep } from "@/api/crm/crm-integration.api";
import { crmGuidePanelSx } from "../styles/crm-wizard-ui.styles";

export type CrmSetupGuidePanelProps = {
  title?: string;
  steps: CrmSetupGuideStep[];
};

export function CrmSetupGuidePanel({ title = "Setup guide", steps }: CrmSetupGuidePanelProps) {
  const theme = useTheme() as AppTheme;
  if (!steps.length) return null;

  const sorted = [...steps].sort((a, b) => a.order - b.order);

  return (
    <Box sx={crmGuidePanelSx}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <MenuBookOutlined sx={{ fontSize: 20, color: theme.palette.info.light }} />
        <Typography variant="medium" fontWeight={700} color="white">
          {title}
        </Typography>
      </Box>
      <Box component="ol" sx={{ m: 0, pl: 2.25, display: "flex", flexDirection: "column", gap: 1.25 }}>
        {sorted.map((step) => (
          <Box component="li" key={step.order}>
            <Typography variant="medium" fontWeight={600} color="white" sx={{ mb: 0.25 }}>
              {step.order}. {step.title}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55 }}>
              {step.body}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
