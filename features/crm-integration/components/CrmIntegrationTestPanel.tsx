"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import { Button, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { EmailFormFieldRow } from "@/api/email/email-forms.api";
import {
  getDistributionSetup,
  listDistributionSetups,
} from "@/api/distribution/distribution-setup.api";
import { DistributionTestFormFieldsPreview } from "@/features/distribution-setup/components/DistributionTestFormFieldsPreview";
import { detailToTestDepartments } from "@/features/distribution-setup/utils/test-departments";
import { buildDistributionTestFormValues } from "@/features/distribution-setup/utils/test-form-values";
import {
  distributionTestFormWrapSx,
  distributionTestTopRowSx,
} from "@/features/distribution-setup/styles/distribution-wizard-ui.styles";
import { useTestCrmConnectionMutation } from "../hooks/useCrmIntegrationQueries";
import type { CrmFieldMappingRow } from "./CrmFieldMappingEditor";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { crmChannelCardSx } from "../styles/crm-wizard-ui.styles";

export type CrmIntegrationTestPanelHandle = {
  submitTest: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
};

export type CrmIntegrationTestSubmitState = {
  canSubmit: boolean;
  isSubmitting: boolean;
};

export type CrmIntegrationTestPanelProps = {
  integrationId: string;
  websiteId: string;
  formFields: EmailFormFieldRow[];
  mappingRows: CrmFieldMappingRow[];
  showInlineSubmitButton?: boolean;
  onSubmitStateChange?: (state: CrmIntegrationTestSubmitState) => void;
};

export const CrmIntegrationTestPanel = forwardRef<
  CrmIntegrationTestPanelHandle,
  CrmIntegrationTestPanelProps
>(function CrmIntegrationTestPanel(
  {
    integrationId,
    websiteId,
    formFields,
    mappingRows,
    showInlineSubmitButton = true,
    onSubmitStateChange,
  },
  ref,
) {
  const theme = useTheme() as AppTheme;
  const testMutation = useTestCrmConnectionMutation();

  const distributionQuery = useQuery({
    queryKey: ["crm-test-distribution", websiteId],
    queryFn: async () => {
      const active = await listDistributionSetups({
        websiteId,
        limit: 1,
        isActive: true,
      });
      const pick = active.items[0]?.id;
      if (pick) return getDistributionSetup(pick);
      const draft = await listDistributionSetups({
        websiteId,
        limit: 1,
        isActive: false,
      });
      if (draft.items[0]?.id) return getDistributionSetup(draft.items[0].id);
      return null;
    },
    enabled: Boolean(websiteId?.trim()),
  });

  const departments = useMemo(
    () => (distributionQuery.data ? detailToTestDepartments(distributionQuery.data) : []),
    [distributionQuery.data],
  );

  const enabledFormFields = useMemo(
    () => formFields.filter((f) => f.enabled),
    [formFields],
  );

  const [departmentName, setDepartmentName] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>(() =>
    buildDistributionTestFormValues(enabledFormFields),
  );

  useEffect(() => {
    setFormValues((prev) => {
      const next = buildDistributionTestFormValues(enabledFormFields);
      for (const key of Object.keys(next)) {
        if (prev[key] !== undefined) next[key] = prev[key];
      }
      return next;
    });
  }, [enabledFormFields]);

  useEffect(() => {
    const first = departments.find((d) => d.name.trim());
    if (first) setDepartmentName(first.name);
  }, [departments]);

  useEffect(() => {
    if (departmentName.trim()) {
      setFormValues((prev) => ({ ...prev, department: departmentName.trim() }));
    }
  }, [departmentName]);

  const departmentOptions = departments
    .filter((d) => d.name.trim())
    .map((d) => ({ label: d.name, value: d.name }));

  const handleFieldChange = (fieldKey: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleTest = () => {
    const payloadValues = {
      ...formValues,
      department: departmentName.trim() || formValues.department?.trim() || "",
    };

    if (!payloadValues.department?.trim()) {
      publishAppToast({
        variant: "error",
        message: "Select a destination department for this test.",
      });
      return;
    }

    void testMutation
      .mutateAsync({
        integrationId,
        mappings: mappingRows
          .filter((r) => r.crmFieldKey.trim())
          .map((r) => ({
            ourFieldKey: r.ourFieldKey,
            crmFieldKey: r.crmFieldKey.trim(),
            label: r.ourFieldLabel,
          })),
        formValues: payloadValues,
      })
      .then((result) => {
        publishAppToast({ variant: "success", message: result.message });
      })
      .catch((err) => {
        publishAppToast({
          variant: "error",
          message: extractApiErrorMessageForToast(err, "CRM test failed."),
        });
      });
  };

  const canSubmit = Boolean(integrationId?.trim()) && !testMutation.isPending;

  useImperativeHandle(ref, () => ({
    submitTest: handleTest,
    canSubmit,
    isSubmitting: testMutation.isPending,
  }));

  useEffect(() => {
    onSubmitStateChange?.({ canSubmit, isSubmitting: testMutation.isPending });
  }, [canSubmit, testMutation.isPending, onSubmitStateChange]);

  return (
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
        Step 5 · Test delivery to CRM
      </Typography>
      <Typography
        variant="medium"
        sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5, mb: 2 }}
      >
        Same as distribution test: pick a department, edit form values, then submit to your CRM.
      </Typography>

      {!departmentOptions.length ? (
        <Typography variant="medium" sx={{ color: theme.palette.warning.main, mb: 2 }}>
          No distribution departments found. Complete distribution recipients for this website first.
        </Typography>
      ) : null}

      <Box sx={{ ...distributionTestTopRowSx, mb: 2 }}>
        <SelectField
          label="Destination department"
          value={departmentName}
          onChange={setDepartmentName}
          options={
            departmentOptions.length
              ? departmentOptions
              : [{ label: "Configure distribution departments first", value: "" }]
          }
        />
      </Box>

      {enabledFormFields.length ? (
        <Box sx={distributionTestFormWrapSx}>
          <DistributionTestFormFieldsPreview
            fields={enabledFormFields}
            values={formValues}
            onFieldChange={handleFieldChange}
          />
        </Box>
      ) : (
        <Typography variant="caption" sx={{ color: theme.palette.warning.main, mb: 2 }}>
          No email form fields enabled — configure the email form for this website first.
        </Typography>
      )}

      {showInlineSubmitButton ? (
        <Button
          type="button"
          variant="primary"
          sx={{ ...gradientPrimaryButtonSx, mt: 2, alignSelf: "flex-start" }}
          disabled={!canSubmit}
          onClick={handleTest}
        >
          {testMutation.isPending ? "Submitting to CRM…" : "Submit test to CRM"}
        </Button>
      ) : null}
    </Box>
  );
});
