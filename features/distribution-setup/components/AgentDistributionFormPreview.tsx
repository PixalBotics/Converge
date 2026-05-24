"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Button, Typography } from "@/components/common";
import type { EmailFormFieldRow } from "@/api/email/email-forms.api";
import { isAgentDistributionFormField } from "@/features/email/constants/agent-distribution-form-fields";
import { EMAIL_FORM_TEST_SAMPLE } from "@/features/email/constants/email-form-test-sample";
import { groupEmailFormFields } from "@/features/email/utils/email-form-field-groups";
import { mergeSx } from "@/lib/mui/merge-sx";
import {
  distributionAgentFormBodySx,
  distributionAgentFormCanvasSx,
  distributionAgentFormHeaderSx,
  distributionPreviewFieldLabelSx,
  distributionPreviewFieldValueSx,
  distributionPreviewSelectSx,
} from "../styles/distribution-wizard-ui.styles";

function fieldMultiline(fieldKey: string, fieldType: string): boolean {
  const t = fieldType.toLowerCase();
  return (
    fieldKey === "transcript" ||
    fieldKey === "journey" ||
    t === "textarea" ||
    t === "multiline"
  );
}

function PreviewSelect({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Box component="label" sx={distributionPreviewFieldLabelSx}>
        {label}
      </Box>
      <Box sx={distributionPreviewSelectSx}>
        <Box component="span" sx={{ flex: 1, color: "#0f172a", fontSize: 14, fontWeight: 500 }}>
          {value}
        </Box>
        <ExpandMore sx={{ color: "#64748b", fontSize: 20 }} />
      </Box>
    </Box>
  );
}

function PreviewField({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <Box>
      <Box component="label" sx={distributionPreviewFieldLabelSx}>
        {label}
      </Box>
      <Box
        sx={mergeSx(
          distributionPreviewFieldValueSx,
          multiline ? { minHeight: 96, whiteSpace: "pre-wrap", lineHeight: 1.5 } : {},
        )}
      >
        {value}
      </Box>
    </Box>
  );
}

export type AgentDistributionFormPreviewProps = {
  fields: EmailFormFieldRow[];
  formType?: "standard" | "custom" | string;
  formName?: string | null;
  loading?: boolean;
  onConfigure?: () => void;
};

export function AgentDistributionFormPreview({
  fields,
  formType = "standard",
  formName,
  loading,
  onConfigure,
}: AgentDistributionFormPreviewProps) {
  const visible = useMemo(() => {
    const list = fields.filter(
      (f) => isAgentDistributionFormField(f.fieldKey) && f.fieldKey !== "department",
    );
    if (formType === "standard") return list;
    return list.filter((f) => f.enabled || f.isRequired);
  }, [fields, formType]);

  const groups = useMemo(() => groupEmailFormFields(visible), [visible]);

  const title =
    formName?.trim() ||
    (formType === "custom" ? "Custom wrap-up" : "Standard wrap-up");

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="medium" fontWeight={700} color="white">
            Agent form preview
          </Typography>
          <Typography variant="caption" sx={{ color: (t) => t.app.dashboard.textMuted, display: "block" }}>
            How agents distribute a chat after it closes — fields are prefilled from the conversation
            (read-only). Additional notes and visitor rating are added automatically in the email.
          </Typography>
        </Box>
        {onConfigure ? (
          <Button type="button" variant="secondary" size="small" onClick={onConfigure}>
            Edit form
          </Button>
        ) : null}
      </Box>

      <Box sx={distributionAgentFormCanvasSx}>
        <Box sx={distributionAgentFormHeaderSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <DescriptionOutlined sx={{ color: "#1a57a5", fontSize: 22 }} />
            <Typography variant="small" fontWeight={700} sx={{ color: "#0f172a" }}>
              Distribute chat transcript
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
            <Chip
              size="small"
              label={formType === "custom" ? "Custom form" : "Standard form"}
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: alpha("#1a57a5", 0.1),
                color: "#1a57a5",
              }}
            />
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              {title}
            </Typography>
          </Box>
        </Box>

        <Box sx={distributionAgentFormBodySx}>
          {loading ? (
            <>
              <Skeleton variant="rounded" height={56} sx={{ bgcolor: "#e2e8f0" }} />
              <Skeleton variant="rounded" height={56} sx={{ bgcolor: "#e2e8f0" }} />
              <Skeleton variant="rounded" height={120} sx={{ bgcolor: "#e2e8f0" }} />
            </>
          ) : visible.length === 0 ? (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="medium" sx={{ color: "#64748b", mb: 1 }}>
                No form configured yet
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 2 }}>
                Set up wrap-up fields so agents can review and send transcripts.
              </Typography>
              {onConfigure ? (
                <Button type="button" variant="primary" size="small" onClick={onConfigure}>
                  Configure form
                </Button>
              ) : null}
            </Box>
          ) : (
            <>
              <PreviewSelect label="Distribution department" value="Sales (3 recipients)" />

              {groups.map(({ group, fields: groupFields }) => (
                <Box key={group.id}>
                  <Typography
                    component="p"
                    sx={{
                      mb: 1.25,
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                    }}
                  >
                    {group.label}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {groupFields.map((field) => {
                      const multiline = fieldMultiline(field.fieldKey, field.fieldType);
                      const sample =
                        EMAIL_FORM_TEST_SAMPLE[field.fieldKey] ??
                        (multiline ? "Long text from chat…" : "Prefilled from chat");
                      return (
                        <PreviewField
                          key={field.fieldKey}
                          label={field.label}
                          value={sample}
                          multiline={multiline}
                        />
                      );
                    })}
                  </Box>
                </Box>
              ))}

              <Box
                sx={{
                  pt: 2,
                  mt: 0.5,
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="button"
                  variant="primary"
                  size="small"
                  disabled
                  sx={{
                    opacity: 1,
                    pointerEvents: "none",
                    bgcolor: "#1a57a5",
                    color: "#fff",
                    px: 2.5,
                    py: 1,
                    borderRadius: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Submit distribution
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
