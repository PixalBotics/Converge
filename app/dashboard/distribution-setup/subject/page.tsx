"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, InputField } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { DISTRIBUTION_ROUTES } from "@/features/distribution-setup/distribution.constants";
import { DistributionWizardShell } from "@/features/distribution-setup";
import { DistributionSaveDraftButton } from "@/features/distribution-setup/components/DistributionWizardDraftActions";
import { DistributionWizardFooter } from "@/features/distribution-setup/components/DistributionWizardFooter";
import { useSyncServerDraftOnStepEnter } from "@/features/distribution-setup/hooks/useSyncServerDraftOnStepEnter";
import { useDistributionWizardNav } from "@/features/distribution-setup/hooks/useDistributionWizardNav";
import { useDistributionSetupDetailQuery } from "@/features/distribution-setup/hooks/useDistributionSetupMutations";
import {
  readWizardEmailFormId,
  readWizardSetupId,
  readWizardSubject,
  readWizardWebsite,
  writeWizardSetupId,
  writeWizardSubject,
} from "@/features/distribution-setup/wizard-storage";

export default function DistributionSubjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupId = searchParams.get("setupId")?.trim() || readWizardSetupId();
  const detailQuery = useDistributionSetupDetailQuery(setupId);
  const websiteId = readWizardWebsite()?.websiteId ?? detailQuery.data?.websiteId ?? "";

  const [subject, setSubject] = useState(() => readWizardSubject());

  const emailConfigurationId =
    detailQuery.data?.emailConfigurationId ?? readWizardEmailFormId();

  const saveOverrides = useMemo(
    () => ({ subject, emailConfigurationId }),
    [subject, emailConfigurationId],
  );

  useEffect(() => {
    if (setupId) writeWizardSetupId(setupId);
  }, [setupId]);

  useEffect(() => {
    if (detailQuery.data?.subject) setSubject(detailQuery.data.subject);
  }, [detailQuery.data?.subject]);

  useEffect(() => {
    writeWizardSubject(subject);
  }, [subject]);

  useEffect(() => {
    if (!websiteId && !setupId) {
      router.replace(DISTRIBUTION_ROUTES.configure);
    }
  }, [router, websiteId, setupId]);

  useSyncServerDraftOnStepEnter(3, setupId, saveOverrides);

  const { goBack, goNext, saving: navSaving } = useDistributionWizardNav({
    currentStep: 3,
    setupId,
    saveOverrides,
  });

  return (
    <DistributionWizardShell
      step={3}
      cardTitle="Email subject"
      subtitle="Your draft is saved to the distribution list when you reach this step. Edit the subject and continue."
      footer={
        <DistributionWizardFooter onBack={goBack}>
          <DistributionSaveDraftButton
            step={3}
            setupId={setupId}
            subject={subject}
            emailConfigurationId={emailConfigurationId}
            disabled={navSaving}
          />
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={navSaving}
            onClick={goNext}
          >
            {navSaving ? "Saving…" : "Continue"}
          </Button>
        </DistributionWizardFooter>
      }
    >
      <InputField
        label="Email subject"
        name="subject"
        placeholder="Chat Transcript - [Company] - [Department]"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
    </DistributionWizardShell>
  );
}
