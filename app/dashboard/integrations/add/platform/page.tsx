"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { DistributionWizardFooter } from "@/features/distribution-setup/components/DistributionWizardFooter";
import {
  SocialMediaPlatformPicker,
  SocialMediaSelectedScopeBanner,
  SocialMediaWizardShell,
  SOCIAL_MEDIA_ROUTES,
  type SocialUiPlatform,
  readSocialMediaWizardPlatform,
  readSocialMediaWizardWebsite,
  writeSocialMediaWizardPlatform,
} from "@/features/social-media";
import { socialChannelCardSx, socialWizardLayoutSx } from "@/features/social-media/styles/social-wizard-ui.styles";
import { publishAppToast } from "@/lib/notify";

export default function SocialMediaAddPlatformPage() {
  const router = useRouter();
  const website = readSocialMediaWizardWebsite();
  const [platform, setPlatform] = useState<SocialUiPlatform | "">(
    () => readSocialMediaWizardPlatform() ?? "facebook",
  );

  useEffect(() => {
    if (!website?.websiteId) {
      router.replace(SOCIAL_MEDIA_ROUTES.addOrg);
    }
  }, [router, website?.websiteId]);

  const handleNext = () => {
    if (!platform) {
      publishAppToast({ variant: "error", message: "Select a platform." });
      return;
    }
    writeSocialMediaWizardPlatform(platform);
    router.push(SOCIAL_MEDIA_ROUTES.addConnect);
  };

  return (
    <SocialMediaWizardShell
      step={2}
      cardTitle="Choose channel"
      subtitle="Pick the Meta channel to connect. You can add the other platforms later from the integrations list."
      footer={
        <DistributionWizardFooter onBack={() => router.push(SOCIAL_MEDIA_ROUTES.addOrg)} backLabel="Back">
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={handleNext}>
            Continue
          </Button>
        </DistributionWizardFooter>
      }
    >
      <Box sx={socialWizardLayoutSx}>
        <SocialMediaSelectedScopeBanner websiteLabel="Website ready for connection" />

        <Box sx={socialChannelCardSx}>
          <Typography
            variant="caption"
            sx={(t) => ({
              color: t.app.dashboard.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: 700,
              fontSize: 10,
              mb: 1.5,
              display: "block",
            })}
          >
            Available platforms
          </Typography>
          <SocialMediaPlatformPicker
            value={platform}
            onChange={(p) => {
              setPlatform(p);
              writeSocialMediaWizardPlatform(p);
            }}
          />
        </Box>
      </Box>
    </SocialMediaWizardShell>
  );
}
