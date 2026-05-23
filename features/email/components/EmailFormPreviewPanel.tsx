"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import MailOutline from "@mui/icons-material/MailOutline";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { EmailFormFieldRow } from "@/api/email/email-forms.api";
import { groupEmailFormFields } from "../utils/email-form-field-groups";
import {
  emailFormPreviewBodySx,
  emailFormPreviewDeviceSx,
  emailFormPreviewHeaderSx,
} from "../styles/email-form-builder.styles";
import { EmailBuilderPanel, EmailPreviewSticky } from "../styles/email-design.styled";

export function EmailFormPreviewPanel({
  formName,
  formType,
  fields,
}: {
  formName: string;
  formType: "standard" | "custom";
  fields: EmailFormFieldRow[];
}) {
  const theme = useTheme() as AppTheme;
  const included = fields.filter((f) => formType === "standard" || f.isRequired || f.enabled);
  const groups = groupEmailFormFields(included);
  const displayName = formName.trim() || (formType === "standard" ? "Standard wrap-up" : "Custom wrap-up");

  return (
    <EmailPreviewSticky>
      <EmailBuilderPanel sx={{ gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Box>
            <Typography variant="medium" fontWeight={700} color="white">
              Live preview
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
              How included fields appear in the distribution wrap-up email.
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`${included.length} fields`}
            sx={{
              fontWeight: 700,
              bgcolor: alpha(theme.palette.primary.main, 0.16),
              color: theme.palette.primary.light,
            }}
          />
        </Box>

        <Box sx={emailFormPreviewDeviceSx}>
          <Box sx={emailFormPreviewHeaderSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <MailOutline sx={{ fontSize: 20 }} />
              <Typography variant="small" fontWeight={700} sx={{ color: "#fff" }}>
                Chat transcript email
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: alpha("#fff", 0.85) }}>
              {displayName}
            </Typography>
          </Box>
          <Box sx={emailFormPreviewBodySx}>
            {groups.map(({ group, fields: groupFields }) => (
              <Box key={group.id} sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    display: "block",
                    mb: 0.75,
                    color: "#64748b",
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    fontSize: 10,
                  }}
                >
                  {group.label}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {groupFields.map((field) => (
                    <Box
                      key={field.fieldKey}
                      sx={{
                        px: 1.25,
                        py: 0.85,
                        borderRadius: 1,
                        bgcolor: "#fff",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 0.25 }}>
                        {field.label}
                      </Typography>
                      <Box
                        sx={{
                          height: 8,
                          borderRadius: 0.5,
                          bgcolor: field.fieldType === "textarea" ? "#e2e8f0" : "#f1f5f9",
                          width: field.fieldType === "textarea" ? "100%" : "62%",
                        }}
                      />
                      {field.fieldType === "textarea" ? (
                        <Box sx={{ height: 8, borderRadius: 0.5, bgcolor: "#f1f5f9", width: "78%", mt: 0.5 }} />
                      ) : null}
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </EmailBuilderPanel>
    </EmailPreviewSticky>
  );
}
