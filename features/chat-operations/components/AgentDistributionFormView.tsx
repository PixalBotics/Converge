"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import { alpha } from "@mui/material/styles";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SendOutlined from "@mui/icons-material/SendOutlined";
import type { AgentDistributionDepartment } from "@/services/chat/agent-distribution.api";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { groupEmailFormFields } from "@/features/email/utils/email-form-field-groups";
import {
  distributionAgentFormBodySx,
  distributionAgentFormCanvasSx,
  distributionAgentFormFooterSx,
  distributionAgentFormGroupLabelSx,
  distributionAgentFormHeaderSx,
  distributionAgentFormInputSx,
  distributionAgentFormPageHeaderSx,
  distributionAgentFormTextareaSx,
  distributionPreviewFieldLabelSx,
  distributionPreviewSelectSx,
} from "@/features/distribution-setup/styles/distribution-wizard-ui.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import {
  agentDistributionFieldMultiline,
  type AgentDistributionFormFieldLike,
} from "../utils/agent-distribution-form.utils";

function DistributionDepartmentSelect({
  departments,
  value,
  onChange,
  disabled,
}: {
  departments: AgentDistributionDepartment[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Box component="label" sx={distributionPreviewFieldLabelSx} htmlFor="distribution-department">
        Distribution department
      </Box>
      <Box sx={{ position: "relative" }}>
        <Box
          component="select"
          id="distribution-department"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          sx={mergeSx(distributionPreviewSelectSx, {
            width: "100%",
            appearance: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.75 : 1,
            pr: 4,
            fontSize: 14,
            fontWeight: 500,
            color: "#0f172a",
            "&:focus": {
              outline: "none",
              borderColor: "#1a57a5",
              boxShadow: "0 0 0 3px rgba(26, 87, 165, 0.12)",
            },
          })}
        >
          {departments.length === 0 ? (
            <option value="">No departments configured</option>
          ) : (
            departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.recipientCount} recipient{d.recipientCount === 1 ? "" : "s"})
              </option>
            ))
          )}
        </Box>
        <ExpandMore
          sx={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#64748b",
            fontSize: 20,
            pointerEvents: "none",
          }}
        />
      </Box>
    </Box>
  );
}

function DistributionFormField({
  field,
  value,
  onChange,
  readOnly,
}: {
  field: AgentDistributionFormFieldLike;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  const multiline = agentDistributionFieldMultiline(field.fieldType, field.fieldKey);
  const locked = readOnly || field.readOnly;

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Box
        component="label"
        sx={distributionPreviewFieldLabelSx}
        htmlFor={`distribution-field-${field.fieldKey}`}
      >
        {field.label}
        {field.isRequired ? (
          <Box component="span" sx={{ color: "#dc2626", ml: 0.35 }}>
            *
          </Box>
        ) : null}
      </Box>
      {multiline ? (
        <Box
          component="textarea"
          id={`distribution-field-${field.fieldKey}`}
          value={value}
          readOnly={locked}
          disabled={locked}
          rows={5}
          onChange={(e) => onChange(e.target.value)}
          sx={mergeSx(
            distributionAgentFormTextareaSx,
            locked ? { bgcolor: "#f8fafc", color: "#475569" } : {},
          )}
        />
      ) : (
        <Box
          component="input"
          id={`distribution-field-${field.fieldKey}`}
          type="text"
          value={value}
          readOnly={locked}
          disabled={locked}
          onChange={(e) => onChange(e.target.value)}
          sx={mergeSx(
            distributionAgentFormInputSx,
            locked ? { bgcolor: "#f8fafc", color: "#475569" } : {},
          )}
        />
      )}
      {locked && value ? (
        <Typography
          variant="caption"
          sx={{ color: "#94a3b8", mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <AutoAwesomeOutlined sx={{ fontSize: 13 }} />
          Prefilled from chat
        </Typography>
      ) : null}
    </Box>
  );
}

export type AgentDistributionFormViewProps = {
  fields: AgentDistributionFormFieldLike[];
  values: Record<string, string>;
  onFieldChange: (fieldKey: string, value: string) => void;
  departments: AgentDistributionDepartment[];
  departmentId: string;
  onDepartmentChange: (id: string) => void;
  subject?: string;
  loading?: boolean;
  submitted?: boolean;
  submitting?: boolean;
  onSubmit?: () => void;
  onBack?: () => void;
};

export function AgentDistributionFormView({
  fields,
  values,
  onFieldChange,
  departments,
  departmentId,
  onDepartmentChange,
  subject,
  loading,
  submitted,
  submitting,
  onSubmit,
  onBack,
}: AgentDistributionFormViewProps) {
  const groups = useMemo(
    () =>
      groupEmailFormFields(
        fields.map((f, index) => ({
          fieldKey: f.fieldKey,
          label: f.label,
          fieldType: f.fieldType,
          sortOrder: index,
          isRequired: Boolean(f.isRequired),
          enabled: f.enabled ?? true,
        })),
      ),
    [fields],
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={distributionAgentFormPageHeaderSx}>
        {onBack ? (
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={onBack}
            startIcon={<ArrowBackOutlined sx={{ fontSize: 18 }} />}
            sx={{ alignSelf: "flex-start", mb: 1.5 }}
          >
            Back to inbox
          </Button>
        ) : null}
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 1.25, mb: 0.5 }}>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ flex: "1 1 auto" }}>
            Distribute chat transcript
          </Typography>
          {submitted ? (
            <Chip
              icon={<CheckCircleOutline sx={{ fontSize: "16px !important" }} />}
              label="Submitted"
              size="small"
              sx={{
                height: 28,
                fontWeight: 600,
                bgcolor: (t) => alpha(t.palette.success.main, 0.15),
                color: (t) => t.palette.success.light,
                border: (t) => `1px solid ${alpha(t.palette.success.main, 0.35)}`,
              }}
            />
          ) : (
            <Chip
              icon={<AutoAwesomeOutlined sx={{ fontSize: "16px !important" }} />}
              label="Auto-filled from chat"
              size="small"
              sx={{
                height: 28,
                fontWeight: 600,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.15),
                color: (t) => t.palette.primary.light,
                border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.35)}`,
              }}
            />
          )}
        </Box>
        <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted, maxWidth: 560 }}>
          Review the prefilled details below, choose a department, and send the transcript email.
        </Typography>
      </Box>

      <Box sx={distributionAgentFormCanvasSx}>
        <Box sx={distributionAgentFormHeaderSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha("#1a57a5", 0.1),
                color: "#1a57a5",
              }}
            >
              <DescriptionOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="small" fontWeight={700} sx={{ color: "#0f172a", lineHeight: 1.3 }}>
                Email distribution
              </Typography>
              {subject ? (
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", display: "block", mt: 0.15, wordBreak: "break-word" }}
                >
                  Subject: {subject}
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Box>

        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!submitted && onSubmit) onSubmit();
          }}
          sx={distributionAgentFormBodySx}
        >
          {loading ? (
            <>
              <Skeleton variant="rounded" height={56} sx={{ bgcolor: "#e2e8f0" }} />
              <Skeleton variant="rounded" height={56} sx={{ bgcolor: "#e2e8f0" }} />
              <Skeleton variant="rounded" height={120} sx={{ bgcolor: "#e2e8f0" }} />
            </>
          ) : (
            <>
              <DistributionDepartmentSelect
                departments={departments}
                value={departmentId}
                onChange={onDepartmentChange}
                disabled={submitted}
              />

              {groups.map(({ group, fields: groupFields }) => (
                <Box key={group.id}>
                  <Typography component="p" sx={distributionAgentFormGroupLabelSx}>
                    {group.label}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                    {groupFields.map((field) => (
                      <DistributionFormField
                        key={field.fieldKey}
                        field={field}
                        value={values[field.fieldKey] ?? ""}
                        onChange={(v) => onFieldChange(field.fieldKey, v)}
                        readOnly={submitted}
                      />
                    ))}
                  </Box>
                </Box>
              ))}

              <Box sx={distributionAgentFormFooterSx}>
                {submitted ? (
                  <Typography variant="medium" sx={{ color: "#64748b", flex: 1 }}>
                    Distribution already submitted for this chat.
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ color: "#94a3b8", flex: 1, alignSelf: "center" }}>
                    Recipients are taken from the selected department&apos;s To/CC/BCC list.
                  </Typography>
                )}
                {!submitted ? (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting || departments.length === 0}
                    startIcon={<SendOutlined sx={{ fontSize: 18 }} />}
                    sx={{
                      ...gradientPrimaryButtonSx,
                      minWidth: 180,
                      px: 2.5,
                      py: 1.1,
                      borderRadius: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    {submitting ? "Sending…" : "Submit distribution"}
                  </Button>
                ) : null}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
