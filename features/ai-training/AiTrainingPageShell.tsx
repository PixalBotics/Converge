"use client";

import type { ReactNode } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { integrationsPageWrapper } from "@/app/dashboard/integrations/integrations.styles";
import { pageWrapper } from "@/app/dashboard/companies/overview.styles";
import { rolesPageWrapper } from "@/app/dashboard/roles/roles.styles";
import {
  aiTrainingPageHeaderActionsSx,
  aiTrainingPageHeaderSx,
} from "./ai-training-ui.styles";
import { Button, Typography } from "@/components/common";
import { AiTrainingSubNav } from "./AiTrainingSubNav";

export function AiTrainingPageShell({
  title,
  subtitle,
  icon,
  backHref,
  backLabel = "Back",
  actions,
  showSubNav = true,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  showSubNav?: boolean;
  children: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  const router = useRouter();

  return (
    <Box sx={[pageWrapper, rolesPageWrapper, integrationsPageWrapper] as SxProps<Theme>}>
      <Box sx={aiTrainingPageHeaderSx}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
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
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, lineHeight: 0 }}>
              {icon}
            </Box>
            <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ lineHeight: 1.25 }}>
              {title}
            </Typography>
          </Stack>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            {subtitle}
          </Typography>
        </Box>
        {actions ? <Box sx={aiTrainingPageHeaderActionsSx}>{actions}</Box> : null}
      </Box>
      {showSubNav ? <AiTrainingSubNav /> : null}
      <Stack spacing={2.5} sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
        {children}
      </Stack>
    </Box>
  );
}
