"use client";

import type { ReactNode } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { pageWrapper } from "@/app/dashboard/companies/overview.styles";
import { rolesPageWrapper } from "@/app/dashboard/roles/roles.styles";
import { Button, Typography } from "@/components/common";

export function AiTrainingStudioShell({
  title,
  subtitle,
  websiteHost,
  backHref,
  backLabel = "Back to training",
  statusChips,
  children,
}: {
  title: string;
  subtitle: string;
  websiteHost?: string;
  backHref: string;
  backLabel?: string;
  statusChips?: ReactNode;
  children: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  const router = useRouter();

  return (
    <Box
      sx={
        [
          pageWrapper,
          rolesPageWrapper,
          {
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            pb: 0,
          },
        ] as SxProps<Theme>
      }
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: `1px solid ${theme.app.dashboard.cardBorder}`,
          background: "linear-gradient(135deg, #0b1224 0%, #111827 45%, #0f172a 100%)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
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
            <Typography variant="regularLarge" fontWeight={700} color="white">
              {title}
            </Typography>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
              {subtitle}
              {websiteHost ? ` · ${websiteHost}` : ""}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {statusChips}
            <Chip
              size="small"
              label="Live training data"
              sx={{
                bgcolor: "rgba(34, 197, 94, 0.15)",
                color: theme.palette.success.light,
                fontWeight: 600,
              }}
            />
            <Chip
              size="small"
              label="Sandbox"
              sx={{
                bgcolor: "rgba(59, 130, 246, 0.15)",
                color: theme.palette.info.light,
                fontWeight: 600,
              }}
            />
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, px: { xs: 1, md: 1.5 }, py: 1.5, bgcolor: "#060b18" }}>
        {children}
      </Box>
    </Box>
  );
}
