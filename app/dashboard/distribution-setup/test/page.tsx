"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getEmailFormForWebsite } from "@/api/email/email-forms.api";
import { Button } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import { resolveSx } from "@/utils/resolveSx";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { isConfigurableEmailFormFieldKey } from "@/features/email/constants/agent-distribution-form-fields";
import { DISTRIBUTION_ROUTES } from "@/features/distribution-setup/distribution.constants";
import {
  DistributionSetupTestPanel,
  DistributionWizardShell,
} from "@/features/distribution-setup";
import type {
  DistributionSetupTestPanelHandle,
  DistributionTestSendState,
} from "@/features/distribution-setup/components/DistributionSetupTestPanel";
import { DistributionSaveDraftButton } from "@/features/distribution-setup/components/DistributionWizardDraftActions";
import { DistributionWizardFooter } from "@/features/distribution-setup/components/DistributionWizardFooter";
import { useDistributionWizardNav } from "@/features/distribution-setup/hooks/useDistributionWizardNav";
import { useDistributionSetupDetailQuery } from "@/features/distribution-setup/hooks/useDistributionSetupMutations";
import {
  detailToTestDepartments,
  tableRowsToTestDepartments,
} from "@/features/distribution-setup/utils/test-departments";
import {
  readWizardEmailFormId,
  readWizardSetupId,
  readWizardSubject,
  readWizardTableRows,
  readWizardWebsite,
  writeWizardSetupId,
} from "@/features/distribution-setup/wizard-storage";

export default function DistributionTestPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const testPanelRef = useRef<DistributionSetupTestPanelHandle>(null);
  const [sendState, setSendState] = useState<DistributionTestSendState>({
    canSend: false,
    isSending: false,
  });
  const setupId = searchParams.get("setupId")?.trim() || readWizardSetupId();
  const detailQuery = useDistributionSetupDetailQuery(setupId);
  const websiteId = readWizardWebsite()?.websiteId ?? detailQuery.data?.websiteId ?? "";

  useEffect(() => {
    if (setupId) writeWizardSetupId(setupId);
  }, [setupId]);

  useEffect(() => {
    if (!websiteId && !setupId) {
      router.replace(DISTRIBUTION_ROUTES.configure);
    }
  }, [router, websiteId, setupId]);

  const formQuery = useQuery({
    queryKey: ["email-form", websiteId],
    queryFn: () => getEmailFormForWebsite(websiteId),
    enabled: Boolean(websiteId),
  });

  const testDepartments = useMemo(() => {
    if (detailQuery.data?.departments.length) {
      return detailToTestDepartments(detailQuery.data);
    }
    const sessionRows = readWizardTableRows();
    if (sessionRows?.length) {
      return tableRowsToTestDepartments(sessionRows);
    }
    return [];
  }, [detailQuery.data]);

  const formFields =
    formQuery.data?.fields.filter((f) => isConfigurableEmailFormFieldKey(f.fieldKey)) ?? [];

  const { goBack, goToList } = useDistributionWizardNav({
    currentStep: 5,
    setupId,
    saveOverrides: {
      subject: detailQuery.data?.subject ?? readWizardSubject(),
      emailConfigurationId:
        detailQuery.data?.emailConfigurationId ??
        readWizardEmailFormId() ??
        formQuery.data?.id,
    },
  });

  return (
    <DistributionWizardShell
      step={5}
      cardTitle="Test delivery"
      footer={
        <DistributionWizardFooter onBack={goBack}>
          <DistributionSaveDraftButton
            step={5}
            setupId={setupId}
            subject={detailQuery.data?.subject ?? readWizardSubject()}
            emailConfigurationId={
              detailQuery.data?.emailConfigurationId ??
              readWizardEmailFormId() ??
              formQuery.data?.id
            }
          />
          <Button
            type="button"
            variant="outlined"
            sx={resolveSx(filterChromeButtonSx, theme)}
            onClick={goToList}
          >
            Done
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={!sendState.canSend}
            onClick={() => testPanelRef.current?.sendTest()}
          >
            {sendState.isSending ? "Sending…" : "Send test email"}
          </Button>
        </DistributionWizardFooter>
      }
    >
      <DistributionSetupTestPanel
        ref={testPanelRef}
        websiteId={websiteId}
        subject={detailQuery.data?.subject ?? readWizardSubject()}
        emailConfigurationId={detailQuery.data?.emailConfigurationId ?? formQuery.data?.id}
        departments={testDepartments}
        formFields={formFields}
        showInlineSendButton={false}
        onSendStateChange={setSendState}
      />
    </DistributionWizardShell>
  );
}
