"use client";

import Box from "@mui/material/Box";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  companyEditStepHeaderRootSx,
  companyEditStepHeaderCalloutSx,
} from "../company-edit.styles";

export type CompanyEditStepHeaderProps = {
  step: 1 | 2;
  title: string;
  description: string;
  /** Optional short tip shown in the info callout. */
  tip?: string;
};

export function CompanyEditStepHeader({ step, title, description, tip }: CompanyEditStepHeaderProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={companyEditStepHeaderRootSx}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: theme.palette.primary.light,
          mb: 0.75,
        }}
      >
        Step {step} of 2
      </Typography>
      <Typography variant="mediumLarge" fontWeight={700} color="white" sx={{ mb: 0.75, lineHeight: 1.3 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.6, maxWidth: 640 }}>
        {description}
      </Typography>
      {tip ? (
        <Box sx={companyEditStepHeaderCalloutSx}>
          <InfoOutlined sx={{ fontSize: 18, flexShrink: 0, mt: 0.15, opacity: 0.9 }} />
          <Typography variant="body2" sx={{ color: theme.app.dashboard.white95, lineHeight: 1.55 }}>
            {tip}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
