"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { CrmPlatformField } from "@/api/crm/crm-integration.api";
import { Typography } from "@/components/common";
import {
  emailFormFieldTableHeadSx,
  emailFormFieldTableRowSx,
  emailFormFieldTableSx,
} from "@/features/email/styles/email-form-builder.styles";

export type CrmFormFieldsTableProps = {
  fields: CrmPlatformField[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
};

export function CrmFormFieldsTable({
  fields,
  title = "CRM form fields",
  subtitle = "Loaded live from your connected CRM form.",
  emptyMessage = "No CRM fields loaded yet.",
}: CrmFormFieldsTableProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mt: 0.25, display: "block" }}>
            {subtitle}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${fields.length} field${fields.length === 1 ? "" : "s"}`}
          sx={{
            fontWeight: 600,
            bgcolor: alpha(theme.palette.common.white, 0.06),
            color: theme.app.dashboard.textMuted,
          }}
        />
      </Box>

      <Box sx={emailFormFieldTableSx}>
        <Box sx={{ ...emailFormFieldTableHeadSx, gridTemplateColumns: "1fr 140px 80px 72px" }}>
          <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.textMuted }}>
            Label
          </Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.textMuted }}>
            CRM key
          </Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.textMuted }}>
            Type
          </Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.textMuted }}>
            Req.
          </Typography>
        </Box>
        {!fields.length ? (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="small" sx={{ color: theme.palette.warning.light }}>
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          fields.map((field) => (
            <Box
              key={field.fieldKey}
              sx={{
                ...emailFormFieldTableRowSx(false),
                gridTemplateColumns: "1fr 140px 80px 72px",
              }}
            >
              <Typography variant="small" color="white" sx={{ wordBreak: "break-word" }}>
                {field.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.primary.light, wordBreak: "break-all" }}
              >
                {field.fieldKey}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {field.dataType ?? "text"}
              </Typography>
              <Typography variant="caption" sx={{ color: field.isRequired ? theme.palette.error.light : theme.app.dashboard.textMuted }}>
                {field.isRequired ? "Yes" : "—"}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
