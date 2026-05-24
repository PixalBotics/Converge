"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { DistributionWizardShell } from "@/features/distribution-setup";
import { DistributionWizardFooter } from "@/features/distribution-setup/components/DistributionWizardFooter";
import { useDistributionWizardNav } from "@/features/distribution-setup/hooks/useDistributionWizardNav";
import { hydrateWizardFromDetail } from "@/features/distribution-setup/utils/hydrate-wizard-from-detail";
import { useDistributionSetupDetailQuery } from "@/features/distribution-setup/hooks/useDistributionSetupMutations";
import { useDistributionAssignedWebsiteIdsQuery } from "@/features/distribution-setup/hooks/useDistributionAssignedWebsiteIds";
import {
  readWizardSetupId,
  readWizardWebsite,
  writeWizardSetupId,
  writeWizardWebsite,
} from "@/features/distribution-setup/wizard-storage";
import {
  isPickWebsiteComplete,
  PickWebsiteFields,
} from "@/features/website-assignments/components/PickWebsiteFields";
import type { PickWebsitePreset } from "@/features/website-assignments/components/PickWebsiteModal";
import { emailFormWebsiteScopeSx } from "@/features/email/styles/email-form-builder.styles";

const EMPTY_PRESET: PickWebsitePreset = {
  websiteId: "",
  parentCompanyId: "",
  childCompanyId: "",
  resellerId: "",
};

export default function ConfigureDistributionPage() {
  const searchParams = useSearchParams();
  const setupIdFromUrl = searchParams.get("setupId")?.trim() || null;
  const setupId = setupIdFromUrl ?? readWizardSetupId();
  const isNewSetup = !setupId;
  const detailQuery = useDistributionSetupDetailQuery(setupId);
  const assignedWebsitesQuery = useDistributionAssignedWebsiteIdsQuery(isNewSetup);
  const excludeWebsiteIds = isNewSetup
    ? (assignedWebsitesQuery.data?.websiteIds ?? [])
    : undefined;
  const [preset, setPreset] = useState<PickWebsitePreset>(() => readWizardWebsite() ?? EMPTY_PRESET);
  const [detailHydrated, setDetailHydrated] = useState(false);

  const { goBack, goNext, saving: navSaving } = useDistributionWizardNav({
    currentStep: 1,
    setupId,
    websitePreset: preset,
  });

  useEffect(() => {
    if (setupId) writeWizardSetupId(setupId);
  }, [setupId]);

  useEffect(() => {
    if (!detailQuery.data || detailHydrated) return;
    hydrateWizardFromDetail(detailQuery.data);
    const d = detailQuery.data;
    setPreset({
      websiteId: d.websiteId,
      resellerId: d.resellerId,
      parentCompanyId: d.parentCompanyId,
      childCompanyId: d.childCompanyId,
    });
    setDetailHydrated(true);
  }, [detailQuery.data, detailHydrated]);

  const scopeLabels = useMemo(() => {
    if (detailQuery.data) {
      return {
        clientOf: detailQuery.data.clientOf,
        parent: detailQuery.data.parentCompany,
        child: detailQuery.data.childCompany,
        website: detailQuery.data.website,
      };
    }
    return null;
  }, [detailQuery.data]);

  const canContinue = isPickWebsiteComplete(preset);

  const handlePresetChange = (next: PickWebsitePreset) => {
    setPreset(next);
    if (isPickWebsiteComplete(next)) {
      writeWizardWebsite(next);
    }
  };

  return (
    <DistributionWizardShell
      step={1}
      cardTitle="Company & website"
      subtitle="Select the organization and website, then continue to the next step."
      websitePreset={preset}
      footer={
        <DistributionWizardFooter onBack={goBack} backLabel="Back to list">
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={!canContinue || navSaving}
            onClick={goNext}
          >
            {navSaving ? "Saving…" : "Continue"}
          </Button>
        </DistributionWizardFooter>
      }
    >
      {scopeLabels && isPickWebsiteComplete(preset) ? (
        <Box sx={[emailFormWebsiteScopeSx, { mb: 2.5 }] as SxProps<Theme>}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              bgcolor: (t) => t.palette.primary.main + "33",
              color: (t) => t.palette.primary.light,
            }}
          >
            <LanguageOutlined />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: (t) => t.app.dashboard.textMuted }}>
              Selected scope
            </Typography>
            <Typography variant="medium" fontWeight={600} color="white">
              {scopeLabels.website}
            </Typography>
            <Typography variant="caption" sx={{ color: (t) => t.app.dashboard.textMuted }}>
              {scopeLabels.parent} → {scopeLabels.child}
              {scopeLabels.clientOf ? ` · ${scopeLabels.clientOf}` : ""}
            </Typography>
          </Box>
        </Box>
      ) : null}

      <PickWebsiteFields
        value={preset}
        onChange={handlePresetChange}
        excludeWebsiteIds={excludeWebsiteIds}
      />
    </DistributionWizardShell>
  );
}
