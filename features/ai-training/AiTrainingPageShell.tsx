"use client";

import type { ReactNode } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  integrationsHeaderActions,
  integrationsPageHeader,
  integrationsPageWrapper,
} from "@/app/dashboard/integrations/integrations.styles";
import { Button, Typography } from "@/components/common";

export function AiTrainingPageShell({
  title,
  subtitle,
  icon,
  backHref,
  backLabel = "Back",
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  const router = useRouter();

  return (
    <Box sx={integrationsPageWrapper}>
      <Box sx={integrationsPageHeader}>
        <Box sx={{ minWidth: 0 }}>
          {backHref ? (
            <Button
              type="button"
              variant="secondary"
              size="small"
              startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
              onClick={() => router.push(backHref)}
              sx={{ mb: 1 }}
            >
              {backLabel}
            </Button>
          ) : null}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            {icon}
            <Typography variant="regularLarge" fontWeight={700} color="white">
              {title}
            </Typography>
          </Stack>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            {subtitle}
          </Typography>
        </Box>
        {actions ? <Box sx={integrationsHeaderActions}>{actions}</Box> : null}
      </Box>
      <Stack spacing={2.5} sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
        {children}
      </Stack>
    </Box>
  );
}
