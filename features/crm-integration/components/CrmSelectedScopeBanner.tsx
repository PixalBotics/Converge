"use client";

import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { emailFormWebsiteScopeSx } from "@/features/email/styles/email-form-builder.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import { getCrmPlatformMeta } from "../crm-platform-meta";
import { CrmPlatformLogo } from "./CrmPlatformLogo";

export type CrmSelectedScopeBannerProps = {
  websiteLabel?: string;
  hierarchyLabel?: string;
  note?: string;
  platformCode?: string | null;
};

export function CrmSelectedScopeBanner({
  websiteLabel = "Website selected",
  hierarchyLabel,
  note = "CRM credentials are saved at child-company level for this organization.",
  platformCode,
}: CrmSelectedScopeBannerProps) {
  const platformMeta = getCrmPlatformMeta(platformCode ?? undefined);

  return (
    <Box sx={mergeSx(emailFormWebsiteScopeSx, { mb: 2.5 })}>
      {platformMeta ? (
        <CrmPlatformLogo platformCode={platformMeta.code} size={48} />
      ) : (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1.75,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            bgcolor: (t) => t.palette.primary.main + "33",
            color: (t) => t.palette.primary.light,
            fontWeight: 700,
          }}
        >
          CRM
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: (t) => t.app.dashboard.textMuted }}>
          {platformMeta ? `${platformMeta.name} integration` : "Selected scope"}
        </Typography>
        <Typography variant="medium" fontWeight={600} color="white">
          {platformMeta?.name ?? websiteLabel}
        </Typography>
        {hierarchyLabel ? (
          <Typography variant="caption" sx={{ color: (t) => t.app.dashboard.textMuted }}>
            {hierarchyLabel}
          </Typography>
        ) : null}
        <Typography variant="caption" sx={{ color: (t) => t.app.dashboard.textMuted, display: "block", mt: 0.35 }}>
          {note}
        </Typography>
      </Box>
    </Box>
  );
}
