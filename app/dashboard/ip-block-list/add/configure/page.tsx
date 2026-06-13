"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { Button, InputField } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { assignWebsiteFormGridSx } from "@/components/common/AssignWebsiteModal/assign-website-modal.styles";
import { DistributionWizardFooter } from "@/features/distribution-setup/components/DistributionWizardFooter";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { IpBlockRuleToggleCard } from "@/features/ip-block/components/IpBlockRuleToggleCard";
import { IpBlockWizardShell } from "@/features/ip-block/IpBlockWizardShell";
import { useCreateIpBlocksMutation } from "@/features/ip-block/hooks/useIpBlockMutations";
import { IP_BLOCK_ROUTES } from "@/features/ip-block/ip-block.constants";
import {
  readIpBlockWizardDraft,
  writeIpBlockWizardDraft,
  type IpBlockWizardDraft,
} from "@/features/ip-block/wizard-storage";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

export default function AddIpBlockConfigurePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<IpBlockWizardDraft | null>(null);
  const createMutation = useCreateIpBlocksMutation();

  useEffect(() => {
    const loaded = readIpBlockWizardDraft();
    if (!loaded.websiteIds.length) {
      router.replace(IP_BLOCK_ROUTES.addOrg);
      return;
    }
    setDraft(loaded);
  }, [router]);

  const patchDraft = useCallback((patch: Partial<IpBlockWizardDraft>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      writeIpBlockWizardDraft(next);
      return next;
    });
  }, []);

  const handleBlock = async () => {
    if (!draft) return;
    if (!draft.ipAddress.trim()) {
      publishAppToast({ message: "Enter an IP address.", variant: "error" });
      return;
    }
    try {
      const result = await createMutation.mutateAsync({
        websiteIds: draft.websiteIds,
        ipAddress: draft.ipAddress.trim(),
        reason: draft.reason.trim() || undefined,
        status: draft.status,
        isActive: draft.isActive,
      });
      writeIpBlockWizardDraft({
        ...draft,
        ipAddress: result.items[0]?.ipAddress ?? draft.ipAddress,
      });
      router.push(IP_BLOCK_ROUTES.addDetails);
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err, "Could not create IP block."),
        variant: "error",
      });
    }
  };

  if (!draft) return null;

  return (
    <IpBlockWizardShell
      step={2}
      cardTitle="IP block configuration"
      subtitle="Enter the visitor IP to block and whether the rule should take effect immediately."
      footer={
        <DistributionWizardFooter
          onBack={() => router.push(IP_BLOCK_ROUTES.addOrg)}
          backLabel="Back"
        >
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => void handleBlock()}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Blocking…" : "Block IP"}
          </Button>
        </DistributionWizardFooter>
      }
    >
      <SchedulingSectionCard
        step={1}
        title="IP details"
        subtitle="IPv4 or IPv6. The same IP can be blocked on multiple websites from the previous step."
      >
        <Box sx={assignWebsiteFormGridSx}>
          <InputField
            label="IP address"
            name="ipAddress"
            placeholder="e.g. 203.0.113.42"
            value={draft.ipAddress}
            onChange={(e) => patchDraft({ ipAddress: e.target.value })}
          />
          <InputField
            label="Reason (optional)"
            name="reason"
            placeholder="E.g. spam messages, suspicious activity…"
            value={draft.reason}
            onChange={(e) => patchDraft({ reason: e.target.value })}
          />
        </Box>
      </SchedulingSectionCard>

      <IpBlockRuleToggleCard
        checked={draft.isActive}
        onChange={(isActive) => patchDraft({ isActive })}
      />
    </IpBlockWizardShell>
  );
}
