"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { alpha, useTheme } from "@mui/material/styles";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import ViewListOutlined from "@mui/icons-material/ViewListOutlined";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  getEmailFormForWebsite,
  upsertEmailForm,
  type EmailFormFieldRow,
} from "@/api/email/email-forms.api";
import { isConfigurableEmailFormFieldKey } from "@/features/email/constants/agent-distribution-form-fields";
import { EmailFormFieldsPanel } from "@/features/email/components/EmailFormFieldsPanel";
import { EmailFormPreviewPanel } from "@/features/email/components/EmailFormPreviewPanel";
import {
  EmailBuilderLayout,
  EmailBuilderPanel,
  EmailBuilderSectionTitle,
} from "@/features/email/styles/email-design.styled";
import { emailFormTypeChoiceCardSx } from "@/features/email/styles/email-form-builder.styles";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { distributionSetupKeys } from "../hooks/keys";
import { writeWizardEmailFormId } from "../wizard-storage";

function FormTypeChoiceCard({
  selected,
  title,
  description,
  icon,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onSelect: () => void;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      sx={emailFormTypeChoiceCardSx(selected)}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: selected
              ? alpha(theme.palette.primary.main, 0.22)
              : alpha(theme.palette.common.white, 0.08),
            color: selected ? theme.palette.primary.light : theme.app.dashboard.textMuted,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography variant="small" fontWeight={700} color="white">
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
        {description}
      </Typography>
    </Box>
  );
}

export type DistributionEmailFormConfiguratorProps = {
  websiteId: string;
  onSaved?: (emailConfigurationId: string) => void;
};

export function DistributionEmailFormConfigurator({
  websiteId,
  onSaved,
}: DistributionEmailFormConfiguratorProps) {
  const theme = useTheme() as AppTheme;
  const qc = useQueryClient();
  const [formType, setFormType] = useState<"standard" | "custom">("standard");
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState<EmailFormFieldRow[]>([]);

  const formQuery = useQuery({
    queryKey: ["email-form", websiteId],
    queryFn: () => getEmailFormForWebsite(websiteId),
    enabled: Boolean(websiteId),
  });

  useEffect(() => {
    if (!formQuery.data) return;
    setFormType(formQuery.data.formType);
    setFormName(formQuery.data.formName ?? "");
    setFields(
      formQuery.data.fields.filter((f) => isConfigurableEmailFormFieldKey(f.fieldKey)),
    );
  }, [formQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertEmailForm({
        websiteId,
        formType,
        formName: formName.trim() || undefined,
        fields: fields
          .filter(
            (f) =>
              isConfigurableEmailFormFieldKey(f.fieldKey) &&
              (formType === "standard" || f.isRequired || f.enabled),
          )
          .map((f) => ({
            fieldKey: f.fieldKey,
            label: f.label,
            fieldType: f.fieldType,
            sortOrder: f.sortOrder,
          })),
      }),
    onSuccess: (data) => {
      if (!data.id) return;
      writeWizardEmailFormId(data.id);
      void qc.invalidateQueries({ queryKey: ["email-form", websiteId] });
      void qc.invalidateQueries({ queryKey: distributionSetupKeys.all });
      onSaved?.(data.id);
      publishAppToast({ variant: "success", message: "Email form saved." });
    },
    onError: (err) => {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err, "Save failed."),
      });
    },
  });

  const toggleField = (key: string, enabled: boolean) => {
    setFields((prev) => prev.map((f) => (f.fieldKey === key ? { ...f, enabled } : f)));
  };

  const setAllOptionalFields = (enabled: boolean) => {
    setFields((prev) => prev.map((f) => (f.isRequired ? f : { ...f, enabled })));
  };

  const visibleFields = useMemo(
    () => fields.filter((f) => formType === "standard" || f.isRequired || f.enabled),
    [fields, formType],
  );

  if (formQuery.isLoading) {
    return (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
        <Skeleton
          variant="rounded"
          height={420}
          sx={{ borderRadius: 2.5, bgcolor: alpha(theme.app.dashboard.pillBg, 0.5) }}
        />
        <Skeleton
          variant="rounded"
          height={420}
          sx={{ borderRadius: 2.5, bgcolor: alpha(theme.app.dashboard.pillBg, 0.5) }}
        />
      </Box>
    );
  }

  return (
    <EmailBuilderLayout>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <EmailBuilderPanel>
          <EmailBuilderSectionTitle>
            <Typography variant="small" fontWeight={700} color="white">
              Form template
            </Typography>
          </EmailBuilderSectionTitle>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            <FormTypeChoiceCard
              selected={formType === "standard"}
              title="Standard"
              description="Full field catalog for distribution emails on this site."
              icon={<ViewListOutlined />}
              onSelect={() => setFormType("standard")}
            />
            <FormTypeChoiceCard
              selected={formType === "custom"}
              title="Custom"
              description="Enable optional fields; required fields always stay on."
              icon={<TuneOutlined />}
              onSelect={() => setFormType("custom")}
            />
          </Box>

          <InputField
            label="Form name"
            name="formName"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder={formType === "standard" ? "Standard distribution form" : "Custom distribution form"}
          />
        </EmailBuilderPanel>

        <EmailBuilderPanel>
          <EmailFormFieldsPanel
            fields={fields}
            formType={formType}
            onToggle={toggleField}
            onSetAllOptional={setAllOptionalFields}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1 }}>
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              disabled={saveMutation.isPending || visibleFields.length === 0}
              onClick={() => void saveMutation.mutateAsync()}
            >
              {saveMutation.isPending ? "Saving…" : "Save email form"}
            </Button>
          </Box>
        </EmailBuilderPanel>
      </Box>

      <EmailFormPreviewPanel formName={formName} formType={formType} fields={fields} />
    </EmailBuilderLayout>
  );
}
