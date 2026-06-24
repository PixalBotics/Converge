"use client";

import Box from "@mui/material/Box";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { InputField, SelectField, Typography } from "@/components/common";
import type { CrmPlatformField } from "@/api/crm/crm-integration.api";
import { mergeSx } from "@/lib/mui/merge-sx";
import {
  crmMappingConnectorSx,
  crmMappingPanelSx,
  crmMappingPillSx,
  crmMappingRowSx,
} from "../styles/crm-wizard-ui.styles";

export type CrmFieldMappingRow = {
  ourFieldKey: string;
  ourFieldLabel: string;
  crmFieldKey: string;
};

export type CrmFieldMappingEditorProps = {
  rows: CrmFieldMappingRow[];
  crmFields: CrmPlatformField[];
  onChange: (ourFieldKey: string, crmFieldKey: string) => void;
};

export function CrmFieldMappingEditor({
  rows,
  crmFields,
  onChange,
}: CrmFieldMappingEditorProps) {
  const theme = useTheme() as AppTheme;
  const useSelect = crmFields.length > 0;
  const crmOptions = [
    { label: "— Not mapped —", value: "" },
    ...crmFields.map((f) => ({
      label: f.label === f.fieldKey ? f.label : `${f.label} (${f.fieldKey})`,
      value: f.fieldKey,
    })),
  ];

  return (
    <Box sx={crmMappingPanelSx}>
      <Typography
        variant="caption"
        sx={{
          color: theme.app.dashboard.textMuted,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontWeight: 700,
          fontSize: 10,
          mb: 2,
          display: "block",
        }}
      >
        Conver field → CRM field
      </Typography>

      {rows.map((row) => (
        <Box key={row.ourFieldKey} sx={crmMappingRowSx}>
          <Typography
            variant="medium"
            sx={{
              color: theme.app.dashboard.textMuted,
              minWidth: { sm: 148 },
              flexShrink: 0,
              textAlign: { sm: "right" },
            }}
          >
            {row.ourFieldLabel}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
            <Box sx={crmMappingConnectorSx} aria-hidden />
            <ArrowForward
              sx={{ display: { xs: "none", sm: "block" }, fontSize: 18, color: theme.palette.primary.light }}
              aria-hidden
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {useSelect ? (
                <SelectField
                  label="CRM field"
                  value={row.crmFieldKey}
                  onChange={(value) => onChange(row.ourFieldKey, value)}
                  options={crmOptions}
                />
              ) : (
                <InputField
                  label="CRM field name"
                  name={`crm-${row.ourFieldKey}`}
                  value={row.crmFieldKey}
                  onChange={(e) => onChange(row.ourFieldKey, e.target.value)}
                  placeholder="e.g. First Name"
                />
              )}
              {row.crmFieldKey ? (
                <Box
                  component="span"
                  sx={mergeSx(crmMappingPillSx, { display: "inline-block", mt: 0.75 })}
                >
                  {crmFields.find((f) => f.fieldKey === row.crmFieldKey)?.label ?? row.crmFieldKey}
                </Box>
              ) : null}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
