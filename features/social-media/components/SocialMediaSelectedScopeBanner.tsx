"use client";

import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { emailFormWebsiteScopeSx } from "@/features/email/styles/email-form-builder.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import type { SocialUiPlatform } from "../social-media.constants";
import { getSocialPlatformMeta } from "../social-platform-meta";
import { SocialMediaPlatformLogo } from "./SocialMediaPlatformLogo";

export type SocialMediaSelectedScopeBannerProps = {
  websiteLabel?: string;
  hierarchyLabel?: string;
  platform?: SocialUiPlatform | null;
  note?: string;
};

export function SocialMediaSelectedScopeBanner({
  websiteLabel = "Website selected",
  hierarchyLabel,
  platform,
  note = "One active connection per platform per website.",
}: SocialMediaSelectedScopeBannerProps) {
  const platformMeta = getSocialPlatformMeta(platform ?? undefined);

  return (
    <Box sx={mergeSx(emailFormWebsiteScopeSx, { mb: 2.5 })}>
      {platformMeta ? (
        <SocialMediaPlatformLogo platform={platformMeta.code} size={48} />
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
          SM
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: (t) => t.app.dashboard.textMuted }}>
          {platformMeta ? `${platformMeta.name} · ${platformMeta.subtitle}` : "Selected scope"}
        </Typography>
        <Typography variant="medium" fontWeight={600} color="white">
          {websiteLabel}
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
