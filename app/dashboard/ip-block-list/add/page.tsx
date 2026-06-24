"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { DistributionWizardFooter } from "@/features/distribution-setup/components/DistributionWizardFooter";
import { IpBlockOrgSelectFields } from "@/features/ip-block/components/IpBlockOrgSelectFields";
import { IpBlockWizardShell } from "@/features/ip-block/IpBlockWizardShell";
import { IP_BLOCK_ROUTES } from "@/features/ip-block/ip-block.constants";
import {
  emptyIpBlockWizardDraft,
  readIpBlockWizardDraft,
  writeIpBlockWizardDraft,
  type IpBlockWizardDraft,
} from "@/features/ip-block/wizard-storage";
import { useAuth } from "@/lib/auth";
import { resolveSessionListFilterScope } from "@/lib/auth/session-scope";
import { publishAppToast } from "@/lib/notify";

export default function AddIpBlockOrganizationPage() {
  const router = useRouter();
  const { user, isPlatformAdmin } = useAuth();
  const [draft, setDraft] = useState<IpBlockWizardDraft>(emptyIpBlockWizardDraft);

  useEffect(() => {
    const loaded = readIpBlockWizardDraft();
    const sessionScope = resolveSessionListFilterScope(isPlatformAdmin, user);
    const merged = {
      ...loaded,
      resellerId: loaded.resellerId || sessionScope.lockedResellerId || "",
      parentCompanyId:
        loaded.parentCompanyId || sessionScope.lockedParentCompanyId || "",
    };
    writeIpBlockWizardDraft(merged);
    setDraft(merged);
  }, [isPlatformAdmin, user]);

  const patchDraft = useCallback((patch: Partial<IpBlockWizardDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      writeIpBlockWizardDraft(next);
      return next;
    });
  }, []);

  const handleNext = () => {
    const sessionScope = resolveSessionListFilterScope(isPlatformAdmin, user);
    if (sessionScope.resellerPickerMode !== "hidden" && sessionScope.resellerPickerMode === "optional") {
      if (!draft.resellerId.trim() && sessionScope.lockedResellerId) {
        patchDraft({ resellerId: sessionScope.lockedResellerId });
      }
    }
    if (!draft.parentCompanyId.trim()) {
      publishAppToast({ message: "Select a parent company.", variant: "error" });
      return;
    }
    if (!draft.websiteIds.length) {
      publishAppToast({ message: "Select at least one website.", variant: "error" });
      return;
    }
    router.push(IP_BLOCK_ROUTES.addConfigure);
  };

  return (
    <IpBlockWizardShell
      step={1}
      cardTitle="Organization & websites"
      subtitle="Select where this IP block applies. Scope follows your tenant permissions."
      footer={
        <DistributionWizardFooter
          onBack={() => router.push(IP_BLOCK_ROUTES.list)}
          backLabel="Back to list"
        >
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={handleNext}>
            Continue
          </Button>
        </DistributionWizardFooter>
      }
    >
      <IpBlockOrgSelectFields draft={draft} onPatch={patchDraft} />
    </IpBlockWizardShell>
  );
}
