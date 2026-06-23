"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import SyncAlt from "@mui/icons-material/SyncAlt";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { DistributionWizardFooter } from "@/features/distribution-setup/components/DistributionWizardFooter";
import {
  SocialMediaManualConnectForm,
  SocialMediaSelectedScopeBanner,
  SocialMediaWizardShell,
  SocialMetaOAuthConnectButton,
  SOCIAL_MEDIA_ROUTES,
  clearSocialMediaWizardDraft,
  getSocialPlatformMeta,
  readSocialMediaWizardPlatform,
  readSocialMediaWizardWebsite,
} from "@/features/social-media";
import {
  socialChannelCardSx,
  socialGuidePanelSx,
  socialWizardLayoutSx,
} from "@/features/social-media/styles/social-wizard-ui.styles";

export default function SocialMediaAddConnectPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const website = readSocialMediaWizardWebsite();
  const platform = readSocialMediaWizardPlatform();
  const meta = getSocialPlatformMeta(platform ?? undefined);
  const websiteId = website?.websiteId ?? "";

  useEffect(() => {
    if (!website?.websiteId) {
      router.replace(SOCIAL_MEDIA_ROUTES.addOrg);
      return;
    }
    if (!platform) {
      router.replace(SOCIAL_MEDIA_ROUTES.addPlatform);
    }
  }, [router, website?.websiteId, platform]);

  const oauthSupported = meta?.oauthSupported === true;

  return (
    <SocialMediaWizardShell
      step={3}
      cardTitle={oauthSupported ? "Authorize with Meta" : "Manual connection"}
      subtitle={
        oauthSupported
          ? "Sign in with the Facebook account that manages this Page. Instagram uses the linked Business account."
          : "Enter WhatsApp Cloud API credentials from Meta Business Suite."
      }
      footer={
        <DistributionWizardFooter
          onBack={() => router.push(SOCIAL_MEDIA_ROUTES.addPlatform)}
          backLabel="Back"
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              clearSocialMediaWizardDraft();
              router.push(SOCIAL_MEDIA_ROUTES.list);
            }}
          >
            Done for now
          </Button>
        </DistributionWizardFooter>
      }
    >
      <Box sx={socialWizardLayoutSx}>
        <SocialMediaSelectedScopeBanner platform={platform} />

        {oauthSupported ? (
          <>
            <Box
              sx={{
                ...socialChannelCardSx,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "stretch", md: "center" },
                justifyContent: "space-between",
                gap: 2,
                p: { xs: 2, md: 2.5 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    bgcolor: alpha(theme.palette.primary.main, 0.18),
                    color: theme.palette.primary.light,
                  }}
                >
                  <SyncAlt />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="medium" fontWeight={700} color="white">
                    {meta?.connectLabel ?? "Connect with Meta"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
                    You will be redirected to Meta to approve messaging access for {meta?.name}. Use the client&apos;s
                    Page admin account when connecting on their behalf.
                  </Typography>
                </Box>
              </Box>
              <SocialMetaOAuthConnectButton websiteId={websiteId} platform={platform!} />
            </Box>

            <Box sx={socialGuidePanelSx}>
              <Typography variant="small" fontWeight={600} color="white" sx={{ mb: 0.5 }}>
                Before you connect
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55 }}>
                Ensure the Facebook Page is in Live mode, webhook URL is configured in your Meta app, and the signing user
                has Page admin access. Instagram requires a linked Instagram Business account.
              </Typography>
            </Box>

            <Box sx={socialChannelCardSx}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.app.dashboard.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  fontWeight: 700,
                  fontSize: 10,
                  mb: 1.5,
                  display: "block",
                }}
              >
                Advanced
              </Typography>
              <SocialMediaManualConnectForm
                websiteId={websiteId}
                platform={platform!}
                showAdvancedToggle
                onSuccess={() => {
                  clearSocialMediaWizardDraft();
                  router.push(SOCIAL_MEDIA_ROUTES.list);
                }}
              />
            </Box>
          </>
        ) : (
          <Box sx={socialChannelCardSx}>
            <SocialMediaManualConnectForm
              websiteId={websiteId}
              platform={platform!}
              onSuccess={() => {
                clearSocialMediaWizardDraft();
                router.push(SOCIAL_MEDIA_ROUTES.list);
              }}
            />
          </Box>
        )}
      </Box>
    </SocialMediaWizardShell>
  );
}
