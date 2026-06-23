"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { DistributionWizardFooter } from "@/features/distribution-setup/components/DistributionWizardFooter";
import {
  SocialMediaWizardShell,
  SOCIAL_MEDIA_ROUTES,
  clearSocialMediaWizardDraft,
  readSocialMediaWizardWebsite,
  writeSocialMediaWizardWebsite,
} from "@/features/social-media";
import { socialChannelCardSx, socialWizardLayoutSx } from "@/features/social-media/styles/social-wizard-ui.styles";
import {
  isPickWebsiteComplete,
  PickWebsiteFields,
} from "@/features/website-assignments/components/PickWebsiteFields";
import type { PickWebsitePreset } from "@/features/website-assignments/components/PickWebsiteModal";

const EMPTY_PRESET: PickWebsitePreset = {
  websiteId: "",
  parentCompanyId: "",
  childCompanyId: "",
  resellerId: "",
};

export default function SocialMediaAddOrganizationPage() {
  const router = useRouter();
  const [preset, setPreset] = useState<PickWebsitePreset>(() => readSocialMediaWizardWebsite() ?? EMPTY_PRESET);

  useEffect(() => {
    if (isPickWebsiteComplete(preset)) writeSocialMediaWizardWebsite(preset);
  }, [preset]);

  const canContinue = isPickWebsiteComplete(preset);

  return (
    <SocialMediaWizardShell
      step={1}
      cardTitle="Company & website"
      subtitle="Select the website that will receive Facebook, Instagram, or WhatsApp messages."
      footer={
        <DistributionWizardFooter
          onBack={() => {
            clearSocialMediaWizardDraft();
            router.push(SOCIAL_MEDIA_ROUTES.list);
          }}
          backLabel="Back to list"
        >
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={!canContinue}
            onClick={() => router.push(SOCIAL_MEDIA_ROUTES.addPlatform)}
          >
            Continue
          </Button>
        </DistributionWizardFooter>
      }
    >
      <Box sx={socialWizardLayoutSx}>
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
            Organization scope
          </Typography>
          <PickWebsiteFields value={preset} onChange={setPreset} showProgressChips={false} />
        </Box>
      </Box>
    </SocialMediaWizardShell>
  );
}
