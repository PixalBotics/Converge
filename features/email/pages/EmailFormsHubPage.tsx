"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, Typography } from "@/components/common";
import { EMAIL_ROUTES } from "../email.constants";
import { EmailSectionLayout } from "../components/EmailSectionLayout";

export function EmailFormsHubPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();

  return (
    <EmailSectionLayout
      title="Email forms"
      description="Standard wrap-up form for all websites under a child company, plus optional custom forms per website."
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <DashboardCard sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <DescriptionOutlined sx={{ fontSize: 36, color: theme.palette.primary.main }} />
          <Typography variant="mediumLarge" fontWeight={700} color="white">
            Standard form
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, flex: 1 }}>
            One default wrap-up form per child company — applied to every website unless a custom
            form overrides it. Stores visitor fields and wrap-up settings per company + website.
          </Typography>
          <Button
            type="button"
            variant="primary"
            onClick={() => router.push(EMAIL_ROUTES.formsStandard)}
          >
            Configure standard form
          </Button>
        </DashboardCard>

        <DashboardCard sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <TuneOutlined sx={{ fontSize: 36, color: theme.palette.secondary.main }} />
          <Typography variant="mediumLarge" fontWeight={700} color="white">
            Custom forms
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, flex: 1 }}>
            Override the standard form for specific child company + website pairs — field layout,
            required fields, and labels per site.
          </Typography>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(EMAIL_ROUTES.formsCustom)}
          >
            Manage custom forms
          </Button>
        </DashboardCard>
      </Box>
    </EmailSectionLayout>
  );
}
