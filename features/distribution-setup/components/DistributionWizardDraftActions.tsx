"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/common";
import type { DistributionWizardStep } from "../distribution-wizard.types";
import { flushWizardStep } from "../utils/flush-wizard-step";
import { readWizardMethod, writeWizardSetupId } from "../wizard-storage";
import { useDistributionDraftSave } from "../hooks/useDistributionDraftSave";
import { publishAppToast } from "@/lib/notify";
import type { DistributionTableRow } from "../utils/map-distribution-rows";

export type DistributionSaveDraftButtonProps = {
  step: DistributionWizardStep;
  setupId: string | null;
  subject?: string;
  emailConfigurationId?: string | null;
  tableRows?: DistributionTableRow[];
  method?: "email" | "crm" | null;
  disabled?: boolean;
};

export function DistributionSaveDraftButton({
  step,
  setupId,
  subject,
  emailConfigurationId,
  tableRows,
  method,
  disabled,
}: DistributionSaveDraftButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { saveDraft, saveDraftToServer, saving } = useDistributionDraftSave(setupId);

  const handleSave = () => {
    if (readWizardMethod() !== "email" && method !== "email") {
      publishAppToast({
        variant: "error",
        message: "Select Email as the delivery method before saving a draft.",
      });
      return;
    }

    void flushWizardStep(step, setupId, saveDraft, saveDraftToServer, {
      subject,
      emailConfigurationId,
      tableRows,
      method: method ?? undefined,
    }).then((id) => {
      if (!id) return;
      writeWizardSetupId(id);
      publishAppToast({
        variant: "success",
        message: "Draft saved. You can resume from the distribution list.",
      });
      if (!searchParams.get("setupId")?.trim()) {
        const q = new URLSearchParams(searchParams.toString());
        q.set("setupId", id);
        router.replace(`${pathname}?${q.toString()}`, { scroll: false });
      }
    });
  };

  return (
    <Button type="button" variant="secondary" disabled={disabled || saving} onClick={handleSave}>
      {saving ? "Saving draft…" : "Save draft"}
    </Button>
  );
}
