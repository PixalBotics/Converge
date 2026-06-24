"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { EmailFormFieldRow } from "@/api/email/email-forms.api";
import type { CrmPlatformField } from "@/api/crm/crm-integration.api";
import { Typography } from "@/components/common";
import { EmailBuilderPanel } from "@/features/email/styles/email-design.styled";
import { crmChannelCardSx } from "../styles/crm-wizard-ui.styles";
import { CrmDistributionFieldsTable } from "./CrmDistributionFieldsTable";
import { CrmFieldMappingEditor, type CrmFieldMappingRow } from "./CrmFieldMappingEditor";
import { CrmFormFieldsTable } from "./CrmFormFieldsTable";

export type CrmFieldMappingWorkspaceProps = {
  emailFormFields: EmailFormFieldRow[];
  crmFields: CrmPlatformField[];
  crmFieldsMessage?: string;
  crmFieldsError?: string | null;
  crmFieldsLoading?: boolean;
  mappingRows: CrmFieldMappingRow[];
  onMappingChange: (ourFieldKey: string, crmFieldKey: string) => void;
};

export function CrmFieldMappingWorkspace({
  emailFormFields,
  crmFields,
  crmFieldsMessage,
  crmFieldsError,
  crmFieldsLoading,
  mappingRows,
  onMappingChange,
}: CrmFieldMappingWorkspaceProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        <EmailBuilderPanel sx={{ p: 2, height: "100%" }}>
          <CrmDistributionFieldsTable fields={emailFormFields} />
        </EmailBuilderPanel>

        <EmailBuilderPanel sx={{ p: 2, height: "100%" }}>
          {crmFieldsLoading ? (
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
              Loading fields from your CRM form…
            </Typography>
          ) : crmFieldsError ? (
            <Box>
              <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 1 }}>
                CRM form fields
              </Typography>
              <Typography variant="medium" sx={{ color: theme.palette.warning.main, lineHeight: 1.55 }}>
                {crmFieldsError}
              </Typography>
            </Box>
          ) : (
            <CrmFormFieldsTable
              fields={crmFields}
              subtitle={crmFieldsMessage ?? "Loaded live from your connected CRM form."}
            />
          )}
        </EmailBuilderPanel>
      </Box>

      {!crmFieldsLoading && !crmFieldsError && crmFields.length > 0 ? (
        <Box sx={crmChannelCardSx}>
          <Typography
            variant="caption"
            sx={{
              color: theme.app.dashboard.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: 700,
              fontSize: 10,
              mb: 0.5,
              display: "block",
            }}
          >
            Step 5 · Map distribution → CRM
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 2, lineHeight: 1.55 }}
          >
            Match each distribution field to a field from your CRM form (same as distribution setup
            field catalog, but mapped to CRM).
          </Typography>
          <CrmFieldMappingEditor rows={mappingRows} crmFields={crmFields} onChange={onMappingChange} />
        </Box>
      ) : null}
    </Box>
  );
}
