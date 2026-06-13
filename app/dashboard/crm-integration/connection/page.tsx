"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  CrmIntegrationWizardShell,
  CrmSetupGuidePanel,
  CrmSelectedScopeBanner,
  CrmWizardFooter,
  CRM_ROUTES,
} from "@/features/crm-integration";
import { crmChannelCardSx, crmWizardLayoutSx } from "@/features/crm-integration/styles/crm-wizard-ui.styles";
import {
  readCrmWizardConfigDraft,
  readCrmWizardConnectionMethod,
  readCrmWizardIntegrationId,
  readCrmWizardPlatform,
  readCrmWizardWebsite,
  writeCrmWizardConfigDraft,
  writeCrmWizardIntegrationId,
} from "@/features/crm-integration/wizard-storage";
import {
  useCrmIntegrationDetailQuery,
  useCrmIntegrationLookupQuery,
  useCrmPlatformsQuery,
  useUpsertCrmIntegrationMutation,
} from "@/features/crm-integration/hooks/useCrmIntegrationQueries";
import { publishAppToast } from "@/lib/notify";

const EMBED_FIELD_KEYS = new Set(["web_form_url", "web_to_lead_url"]);

export default function CrmConnectionPage() {
  const router = useRouter();
  const website = readCrmWizardWebsite();
  const platformCode = readCrmWizardPlatform();
  const connectionMethod = readCrmWizardConnectionMethod();
  const integrationIdFromWizard = readCrmWizardIntegrationId();
  const platformsQuery = useCrmPlatformsQuery();
  const lookupQuery = useCrmIntegrationLookupQuery(
    website?.childCompanyId ?? null,
    platformCode,
  );
  const integrationId = integrationIdFromWizard ?? lookupQuery.data?.id ?? null;
  const detailQuery = useCrmIntegrationDetailQuery(integrationId);
  const upsertMutation = useUpsertCrmIntegrationMutation();
  const configHydratedRef = useRef(false);

  const [config, setConfig] = useState<Record<string, string>>(() => readCrmWizardConfigDraft());

  useEffect(() => {
    if (!website?.childCompanyId || !platformCode || !connectionMethod) {
      router.replace(CRM_ROUTES.configure);
    }
  }, [router, website?.childCompanyId, platformCode, connectionMethod]);

  const platform = useMemo(
    () => platformsQuery.data?.items.find((p) => p.code === platformCode),
    [platformsQuery.data?.items, platformCode],
  );

  const visibleSteps = useMemo(
    () =>
      (platform?.configSteps ?? []).filter((s) =>
        s.methods.includes(connectionMethod ?? ""),
      ),
    [platform?.configSteps, connectionMethod],
  );

  const guideSteps = platform?.setupGuide?.[connectionMethod ?? ""] ?? [];

  useEffect(() => {
    const source = detailQuery.data ?? lookupQuery.data;
    if (!source) return;
    writeCrmWizardIntegrationId(source.id);
    if (source.connectionMethod !== connectionMethod) return;
    if (configHydratedRef.current) return;
    setConfig({ ...source.config });
    writeCrmWizardConfigDraft(source.config);
    configHydratedRef.current = true;
  }, [detailQuery.data, lookupQuery.data, connectionMethod]);

  useEffect(() => {
    writeCrmWizardConfigDraft(config);
  }, [config]);

  const updateField = (fieldKey: string, value: string) => {
    setConfig((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleSaveAndNext = async () => {
    if (!website?.childCompanyId || !platformCode || !connectionMethod) return;
    try {
      const saved = await upsertMutation.mutateAsync({
        companyId: website.childCompanyId,
        platformCode,
        connectionMethod,
        config,
        websiteId: website.websiteId,
      });
      writeCrmWizardIntegrationId(saved.id);
      publishAppToast({ variant: "success", message: "CRM connection saved." });
      router.push(CRM_ROUTES.fieldMapping);
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: e instanceof Error ? e.message : "Could not save CRM connection.",
      });
    }
  };

  return (
    <CrmIntegrationWizardShell
      step={4}
      cardTitle={`${platform?.name ?? "CRM"} connection`}
      subtitle="Paste your CRM form URL or embed HTML (like distribution setup), then continue to field mapping."
      footer={
        <CrmWizardFooter onBack={() => router.push(CRM_ROUTES.connectionMethod)} backLabel="Back">
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={upsertMutation.isPending}
            onClick={() => void handleSaveAndNext()}
          >
            {upsertMutation.isPending ? "Saving…" : "Save & continue"}
          </Button>
        </CrmWizardFooter>
      }
    >
      <Box sx={crmWizardLayoutSx}>
        <CrmSelectedScopeBanner platformCode={platformCode} />

        <CrmSetupGuidePanel steps={guideSteps} />

        <Box sx={crmChannelCardSx}>
          <Typography
            variant="caption"
            sx={(t) => ({
              color: t.app.dashboard.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: 700,
              fontSize: 10,
              mb: 0.5,
              display: "block",
            })}
          >
            Step 4 · Connection details
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: (t) => t.app.dashboard.textMuted, display: "block", mb: 2, lineHeight: 1.55 }}
          >
            For Zoho or Salesforce Web-to-Lead you can paste the public form URL or the full embed
            HTML from your CRM — fields on the next step come from this form only.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {visibleSteps.map((step) => {
              const isEmbedField = EMBED_FIELD_KEYS.has(step.fieldKey);
              const value = config[step.fieldKey] ?? "";

              if (isEmbedField) {
                return (
                  <InputField
                    key={step.fieldKey}
                    label={step.label}
                    name={step.fieldKey}
                    value={value}
                    onChange={(e) => updateField(step.fieldKey, e.target.value)}
                    multiline
                    minRows={8}
                    placeholder={
                      step.helpText ??
                      "Public form URL or paste full embed HTML from Zoho / Salesforce"
                    }
                  />
                );
              }

              return (
                <InputField
                  key={step.fieldKey}
                  label={step.label}
                  name={step.fieldKey}
                  type={step.fieldType === "password" ? "password" : "text"}
                  value={value}
                  onChange={(e) => updateField(step.fieldKey, e.target.value)}
                  placeholder={step.helpText ?? undefined}
                />
              );
            })}
          </Box>
        </Box>
      </Box>
    </CrmIntegrationWizardShell>
  );
}
