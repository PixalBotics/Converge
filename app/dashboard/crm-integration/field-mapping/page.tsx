"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import { Button } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { getEmailFormForWebsite } from "@/api/email/email-forms.api";
import {
  CrmFieldMappingWorkspace,
  CrmIntegrationTestPanel,
  CrmIntegrationWizardShell,
  CrmSelectedScopeBanner,
  CrmWizardFooter,
  CRM_ROUTES,
} from "@/features/crm-integration";
import type { CrmFieldMappingRow } from "@/features/crm-integration";
import { crmWizardLayoutSx } from "@/features/crm-integration/styles/crm-wizard-ui.styles";
import { buildCrmMappingRowsFromEmailForm } from "@/features/crm-integration/utils/build-crm-mapping-rows";
import {
  readCrmWizardIntegrationId,
  readCrmWizardPlatform,
  readCrmWizardWebsite,
  clearCrmWizardDraft,
} from "@/features/crm-integration/wizard-storage";
import {
  useCrmDiscoverFieldsQuery,
  useCrmIntegrationDetailQuery,
  useCrmIntegrationLookupQuery,
  useUpsertCrmFieldMappingsMutation,
} from "@/features/crm-integration/hooks/useCrmIntegrationQueries";
import type { CrmIntegrationTestPanelHandle } from "@/features/crm-integration/components/CrmIntegrationTestPanel";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { DISTRIBUTION_ROUTES } from "@/features/distribution-setup/distribution.constants";

export default function CrmFieldMappingPage() {
  const router = useRouter();
  const testPanelRef = useRef<CrmIntegrationTestPanelHandle>(null);
  const website = readCrmWizardWebsite();
  const platformCode = readCrmWizardPlatform();
  const integrationIdFromWizard = readCrmWizardIntegrationId();

  const lookupQuery = useCrmIntegrationLookupQuery(
    website?.childCompanyId ?? null,
    platformCode,
  );

  const integrationId = integrationIdFromWizard ?? lookupQuery.data?.id ?? null;
  const detailQuery = useCrmIntegrationDetailQuery(integrationId);
  const discoverQuery = useCrmDiscoverFieldsQuery(integrationId);
  const saveMappings = useUpsertCrmFieldMappingsMutation(integrationId ?? "");

  const emailFormQuery = useQuery({
    queryKey: ["email-form", website?.websiteId],
    queryFn: () => getEmailFormForWebsite(website!.websiteId),
    enabled: Boolean(website?.websiteId?.trim()),
  });

  const discoveredCrmFields = useMemo(
    () => discoverQuery.data?.fields ?? [],
    [discoverQuery.data?.fields],
  );

  const hasLiveCrmFields = discoveredCrmFields.length > 0 && discoverQuery.isSuccess;

  const [rows, setRows] = useState<CrmFieldMappingRow[]>([]);
  const [rowsInitialized, setRowsInitialized] = useState(false);
  const [testCanSubmit, setTestCanSubmit] = useState(false);
  const [testSubmitting, setTestSubmitting] = useState(false);

  useEffect(() => {
    setRowsInitialized(false);
  }, [integrationId]);

  useEffect(() => {
    if (!website?.childCompanyId || !platformCode) {
      router.replace(CRM_ROUTES.configure);
      return;
    }
    if (!integrationId && !lookupQuery.isLoading && lookupQuery.isFetched) {
      router.replace(CRM_ROUTES.connection);
    }
  }, [
    router,
    website?.childCompanyId,
    platformCode,
    integrationId,
    lookupQuery.isLoading,
    lookupQuery.isFetched,
  ]);

  useEffect(() => {
    if (rowsInitialized) return;
    if (!emailFormQuery.data?.fields?.length) return;
    if (discoverQuery.isLoading || !discoverQuery.isSuccess) return;
    if (!discoveredCrmFields.length) return;

    const savedMappings =
      detailQuery.data?.fieldMappings ?? lookupQuery.data?.fieldMappings ?? [];

    setRows(
      buildCrmMappingRowsFromEmailForm({
        emailFormFields: emailFormQuery.data.fields,
        savedMappings,
        discoveredCrmFields,
      }),
    );
    setRowsInitialized(true);
  }, [
    rowsInitialized,
    emailFormQuery.data,
    detailQuery.data,
    lookupQuery.data,
    discoverQuery.isLoading,
    discoverQuery.isSuccess,
    discoveredCrmFields,
  ]);

  const discoverError = discoverQuery.isError
    ? extractApiErrorMessageForToast(
        discoverQuery.error,
        "Could not load fields from your CRM form. Go back and paste the public form URL or embed HTML.",
      )
    : discoverQuery.isSuccess && !discoveredCrmFields.length
      ? "No fields were found on your CRM form. Update the connection step and try again."
      : null;

  const handleChange = (ourFieldKey: string, crmFieldKey: string) => {
    setRows((prev) =>
      prev.map((row) => (row.ourFieldKey === ourFieldKey ? { ...row, crmFieldKey } : row)),
    );
  };

  const handleSave = async () => {
    if (!integrationId) return;
    try {
      await saveMappings.mutateAsync({
        mappings: rows
          .filter((r) => r.crmFieldKey.trim())
          .map((r) => ({
            ourFieldKey: r.ourFieldKey,
            crmFieldKey: r.crmFieldKey.trim(),
            label: r.ourFieldLabel,
          })),
      });
      publishAppToast({ variant: "success", message: "Field mappings saved." });
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: e instanceof Error ? e.message : "Could not save field mappings.",
      });
    }
  };

  const handleFinish = async () => {
    await handleSave();
    clearCrmWizardDraft();
    publishAppToast({
      variant: "success",
      message: "CRM integration complete. Configure distribution to use CRM or Both.",
    });
    router.push(DISTRIBUTION_ROUTES.configure);
  };

  return (
    <CrmIntegrationWizardShell
      step={5}
      cardTitle="Field mapping"
      subtitle="Map distribution email form fields to your live CRM form — same layout as distribution setup."
      footer={
        <CrmWizardFooter onBack={() => router.push(CRM_ROUTES.connection)} backLabel="Back">
          <Button
            type="button"
            variant="secondary"
            disabled={saveMappings.isPending || !integrationId}
            onClick={() => void handleSave()}
          >
            Save mappings
          </Button>
          {hasLiveCrmFields ? (
            <Button
              type="button"
              variant="secondary"
              disabled={!testCanSubmit || testSubmitting}
              onClick={() => testPanelRef.current?.submitTest()}
            >
              {testSubmitting ? "Submitting to CRM…" : "Submit test to CRM"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={saveMappings.isPending || !integrationId || !hasLiveCrmFields}
            onClick={() => void handleFinish()}
          >
            Finish & set up distribution
          </Button>
        </CrmWizardFooter>
      }
    >
      <Box sx={crmWizardLayoutSx}>
        <CrmSelectedScopeBanner platformCode={platformCode} />

        {emailFormQuery.data?.fields ? (
          <CrmFieldMappingWorkspace
            emailFormFields={emailFormQuery.data.fields}
            crmFields={discoveredCrmFields}
            crmFieldsMessage={discoverQuery.data?.message}
            crmFieldsError={discoverError}
            crmFieldsLoading={discoverQuery.isLoading}
            mappingRows={rowsInitialized ? rows : []}
            onMappingChange={handleChange}
          />
        ) : null}

        {integrationId && website?.websiteId && emailFormQuery.data?.fields && hasLiveCrmFields ? (
          <CrmIntegrationTestPanel
            ref={testPanelRef}
            integrationId={integrationId}
            websiteId={website.websiteId}
            formFields={emailFormQuery.data.fields}
            mappingRows={rows}
            showInlineSubmitButton={false}
            onSubmitStateChange={({ canSubmit, isSubmitting }) => {
              setTestCanSubmit(canSubmit);
              setTestSubmitting(isSubmitting);
            }}
          />
        ) : null}
      </Box>
    </CrmIntegrationWizardShell>
  );
}
