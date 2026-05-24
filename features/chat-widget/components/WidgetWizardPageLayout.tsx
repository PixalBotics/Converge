"use client";

import type { ReactNode } from "react";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { distributionWizardDraftNoticeSx } from "@/app/dashboard/distribution-setup/wizard.styles";
import { WidgetWizardConfigChecklist } from "@/features/chat-widget/components/WidgetWizardConfigChecklist";

export type WidgetWizardPageLayoutProps = {
  children: ReactNode;
  preview: ReactNode;
  draftNotice?: string | null;
  showChecklist?: boolean;
  checklistRefreshKey?: number;
};

export function WidgetWizardPageLayout({
  children,
  preview,
  draftNotice,
  showChecklist = true,
  checklistRefreshKey = 0,
}: WidgetWizardPageLayoutProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) minmax(320px, 400px)" },
        gap: 3,
        alignItems: "start",
        mt: 1,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>
        {draftNotice ? (
          <Box sx={distributionWizardDraftNoticeSx}>
            <InfoOutlined sx={{ fontSize: 20, mt: 0.15, flexShrink: 0 }} />
            <Typography variant="body2" component="span">
              {draftNotice}
            </Typography>
          </Box>
        ) : null}
        {children}
      </Box>

      <Box
        sx={{
          position: { xl: "sticky" },
          top: 16,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxHeight: { xl: "calc(100vh - 120px)" },
          overflowY: { xl: "auto" },
        }}
      >
        <Box
          sx={{
            borderRadius: 2.5,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: "rgba(255,255,255,0.03)",
            p: 2,
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          }}
        >
          <Typography fontWeight={700} sx={{ fontSize: 15, mb: 0.5 }}>
            Live preview (draft)
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
            Updates as you edit. Publish on Install for the live embed.
          </Typography>
          {preview}
        </Box>
        {showChecklist ? <WidgetWizardConfigChecklist refreshKey={checklistRefreshKey} /> : null}
      </Box>
    </Box>
  );
}
