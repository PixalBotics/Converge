"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { EmailFormFieldRow } from "@/api/email/email-forms.api";
import { InputField, Typography } from "@/components/common";
import { isConfigurableEmailFormFieldKey } from "@/features/email/constants/agent-distribution-form-fields";
import {
  distributionTestFormFieldFullSx,
  distributionTestFormGridSx,
  distributionTestFormWrapSx,
} from "../styles/distribution-wizard-ui.styles";
import { groupEmailFormFields } from "@/features/email/utils/email-form-field-groups";

function fieldMultiline(fieldKey: string, fieldType: string): boolean {
  const t = fieldType.toLowerCase();
  return (
    fieldKey === "transcript" ||
    fieldKey === "journey" ||
    t === "textarea" ||
    t === "multiline"
  );
}

function multilineRows(fieldKey: string): number {
  if (fieldKey === "transcript") return 3;
  if (fieldKey === "journey") return 2;
  return 2;
}

export type DistributionTestFormFieldsPreviewProps = {
  fields: EmailFormFieldRow[];
  values: Record<string, string>;
  onFieldChange: (fieldKey: string, value: string) => void;
};

export function DistributionTestFormFieldsPreview({
  fields,
  values,
  onFieldChange,
}: DistributionTestFormFieldsPreviewProps) {
  const theme = useTheme() as AppTheme;
  const enabled = fields.filter(
    (f) => f.enabled && isConfigurableEmailFormFieldKey(f.fieldKey),
  );
  if (!enabled.length) {
    return (
      <Typography variant="caption" sx={{ color: "#f59e0b" }}>
        No email form fields enabled — configure the form on the Email step first.
      </Typography>
    );
  }

  const groups = groupEmailFormFields(enabled);

  return (
    <Box sx={distributionTestFormWrapSx}>
      <Typography
        variant="caption"
        sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.25 }}
      >
        Edit distribution form values for this test send (template layout unchanged).
      </Typography>
      {groups.map(({ group, fields: rows }) => (
        <Box key={group.id} sx={{ mb: 1.5, "&:last-of-type": { mb: 0 } }}>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.primary.light,
              fontWeight: 700,
              display: "block",
              mb: 0.75,
              letterSpacing: 0.4,
              textTransform: "uppercase",
              fontSize: 10,
            }}
          >
            {group.label}
          </Typography>
          <Box sx={distributionTestFormGridSx}>
            {rows.map((field) => {
              const multiline = fieldMultiline(field.fieldKey, field.fieldType);
              return (
                <Box
                  key={field.fieldKey}
                  sx={multiline ? distributionTestFormFieldFullSx : undefined}
                >
                  <InputField
                    label={field.label}
                    name={field.fieldKey}
                    value={values[field.fieldKey] ?? ""}
                    onChange={(e) => onFieldChange(field.fieldKey, e.target.value)}
                    multiline={multiline}
                    minRows={multiline ? multilineRows(field.fieldKey) : undefined}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
