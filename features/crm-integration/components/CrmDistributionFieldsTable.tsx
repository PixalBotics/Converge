"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { EmailFormFieldRow } from "@/api/email/email-forms.api";
import { Typography } from "@/components/common";
import { isConfigurableEmailFormFieldKey } from "@/features/email/constants/agent-distribution-form-fields";
import {
  emailFormFieldTableHeadSx,
  emailFormFieldTableRowSx,
  emailFormFieldTableSx,
} from "@/features/email/styles/email-form-builder.styles";
import { CRM_DEPARTMENT_FIELD_KEY, CRM_DEPARTMENT_FIELD_LABEL } from "../crm-field-map.constants";

export type CrmDistributionFieldsTableProps = {
  fields: EmailFormFieldRow[];
};

export function CrmDistributionFieldsTable({ fields }: CrmDistributionFieldsTableProps) {
  const theme = useTheme() as AppTheme;

  const rows = fields.filter((f) => f.enabled && isConfigurableEmailFormFieldKey(f.fieldKey));
  const withDepartment = [
    ...rows,
    ...(rows.some((r) => r.fieldKey === CRM_DEPARTMENT_FIELD_KEY)
      ? []
      : [
          {
            fieldKey: CRM_DEPARTMENT_FIELD_KEY,
            label: CRM_DEPARTMENT_FIELD_LABEL,
            fieldType: "select",
            sortOrder: 999,
            isRequired: true,
            enabled: true,
          } satisfies EmailFormFieldRow,
        ]),
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Distribution form fields
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mt: 0.25, display: "block" }}>
            Same fields agents fill when closing a chat (email form for this website).
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${withDepartment.length} active`}
          sx={{
            fontWeight: 600,
            bgcolor: alpha(theme.palette.common.white, 0.06),
            color: theme.app.dashboard.textMuted,
          }}
        />
      </Box>

      <Box sx={emailFormFieldTableSx}>
        <Box sx={emailFormFieldTableHeadSx}>
          <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.textMuted }}>
            Label
          </Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.textMuted }}>
            Field key
          </Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.textMuted }}>
            Status
          </Typography>
        </Box>
        {!withDepartment.length ? (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="small" sx={{ color: theme.palette.warning.light }}>
              Configure the email form for this website on Distribution setup first.
            </Typography>
          </Box>
        ) : (
          withDepartment.map((field) => (
            <Box key={field.fieldKey} sx={emailFormFieldTableRowSx(true)}>
              <Typography variant="small" color="white">
                {field.label}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {field.fieldKey}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.success.light }}>
                Active
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
