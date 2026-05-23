"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { DISTRIBUTION_ROUTES } from "@/features/distribution-setup/distribution.constants";
import { DistributionWizardShell } from "@/features/distribution-setup";
import { PickWebsiteModal } from "@/features/website-assignments/components/PickWebsiteModal";
import {
  readWizardWebsite,
  writeWizardWebsite,
} from "@/features/distribution-setup/wizard-storage";

export default function ConfigureDistributionPage() {
  const router = useRouter();
  const [pickOpen, setPickOpen] = useState(false);
  const [hasWebsite, setHasWebsite] = useState(false);

  useEffect(() => {
    const saved = readWizardWebsite();
    if (saved?.websiteId) {
      setHasWebsite(true);
    } else {
      setPickOpen(true);
    }
  }, []);

  return (
    <>
      <DistributionWizardShell
        step={1}
        cardTitle="Configure distribution"
        subtitle="Choose the child company and website for this routing setup."
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => router.push(DISTRIBUTION_ROUTES.home)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPickOpen(true)}
            >
              {hasWebsite ? "Change website" : "Select website"}
            </Button>
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              disabled={!hasWebsite}
              onClick={() => router.push(DISTRIBUTION_ROUTES.settings)}
            >
              Next
            </Button>
          </>
        }
      >
        <Box sx={{ py: 1 }}>
          <Typography variant="medium" sx={{ color: "text.secondary" }}>
            {hasWebsite
              ? "Website selected — continue to distribution settings."
              : "Select organization and website to continue."}
          </Typography>
        </Box>
      </DistributionWizardShell>

      <PickWebsiteModal
        open={pickOpen}
        title="Configure distribution"
        description="Step 1 of 3: Pick the website that will receive transcript routing rules."
        primaryLabel="Continue"
        onClose={() => {
          setPickOpen(false);
          if (!readWizardWebsite()?.websiteId) {
            router.push(DISTRIBUTION_ROUTES.home);
          }
        }}
        onContinue={(picked) => {
          writeWizardWebsite(picked);
          setPickOpen(false);
          setHasWebsite(true);
        }}
        preset={readWizardWebsite()}
      />
    </>
  );
}
