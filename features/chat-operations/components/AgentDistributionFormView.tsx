"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import { alpha, useTheme } from "@mui/material/styles";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import SendOutlined from "@mui/icons-material/SendOutlined";
import type { AppTheme } from "@/theme/theme";
import type { AgentDistributionDepartment } from "@/services/chat/agent-distribution.api";
import {
  Button,
  DashboardCard,
  InputField,
  SelectField,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { cardPadding } from "@/app/dashboard/dashboard.styles";
import {
  distributionTestFormFieldFullSx,
  distributionTestFormGridSx,
} from "@/features/distribution-setup/styles/distribution-wizard-ui.styles";
import { groupEmailFormFields } from "@/features/email/utils/email-form-field-groups";
import {
  agentDistributionFieldMultiline,
  agentDistributionMultilineRows,
  type AgentDistributionFormFieldLike,
} from "../utils/agent-distribution-form.utils";

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
  const theme = useTheme() as AppTheme;
  const multiline = agentDistributionFieldMultiline(field.fieldType, field.fieldKey);
  const locked = readOnly || field.readOnly;

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <InputField
        label={field.label}
        name={field.fieldKey}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        multiline={multiline}
        minRows={multiline ? agentDistributionMultilineRows(field.fieldKey) : undefined}
        disabled={locked}
        required={field.isRequired}
      />
      {locked && value ? (
        <Typography
          variant="caption"
          sx={{
            color: theme.app.dashboard.textMuted,
            mt: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <AutoAwesomeOutlined sx={{ fontSize: 13, color: theme.palette.primary.light }} />
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
  method?: string;
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
  method,
  loading,
  submitted,
  submitting,
  onSubmit,
  onBack,
}: AgentDistributionFormViewProps) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;

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

  const deliveryMethod = method?.trim().toLowerCase() ?? "email";
  const usesCrm = deliveryMethod === "crm" || deliveryMethod === "both";
  const formTitle =
    deliveryMethod === "crm"
      ? "CRM distribution"
      : deliveryMethod === "both"
        ? "Email & CRM distribution"
        : "Email distribution";
  const submitLabel =
    deliveryMethod === "crm"
      ? "Submit to CRM"
      : deliveryMethod === "both"
        ? "Send email & CRM"
        : "Send distribution email";

  const departmentOptions = departments.map((dept) => {
    const suffix =
      dept.recipientCount > 0
        ? `${dept.recipientCount} recipient${dept.recipientCount === 1 ? "" : "s"}`
        : usesCrm
          ? "CRM"
          : "no recipients";
    return {
      value: dept.id,
      label: `${dept.name} (${suffix})`,
    };
  });
  const groupLabelSx = {
    color: theme.palette.primary.light,
    fontWeight: 700,
    display: "block",
    mb: 0.75,
    letterSpacing: 0.4,
    textTransform: "uppercase" as const,
    fontSize: 10,
  };

  return (
    <Box sx={{ width: "100%" }}>
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

      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            gap: 1.25,
            mb: 0.5,
          }}
        >
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
                bgcolor: alpha(theme.palette.success.main, 0.15),
                color: theme.palette.success.light,
                border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`,
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
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.light,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
              }}
            />
          )}
        </Box>
        <Typography variant="medium" sx={{ color: d.textMuted, maxWidth: 720 }}>
          Review the prefilled details, choose a department, and send the transcript email.
        </Typography>
      </Box>

      <DashboardCard
        sx={{
          ...cardPadding,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        <Box
          sx={{
            mb: 2.5,
            pb: 2,
            borderBottom: `1px solid ${alpha(d.cardBorder, 0.75)}`,
            display: "flex",
            alignItems: "flex-start",
            gap: 1.25,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(d.accentBlue, 0.15),
              color: d.accentBlue,
            }}
          >
            <DescriptionOutlined sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="mediumLarge" fontWeight={700} color="white">
              {formTitle}
            </Typography>
            {subject ? (
              <Typography
                variant="caption"
                sx={{ color: d.textMuted, display: "block", mt: 0.35, wordBreak: "break-word" }}
              >
                Subject: {subject}
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!submitted && onSubmit) onSubmit();
          }}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {loading ? (
            <>
              <Skeleton
                variant="rounded"
                height={56}
                sx={{ bgcolor: alpha(d.cardBorder, 0.35) }}
              />
              <Skeleton
                variant="rounded"
                height={56}
                sx={{ bgcolor: alpha(d.cardBorder, 0.35) }}
              />
              <Skeleton
                variant="rounded"
                height={120}
                sx={{ bgcolor: alpha(d.cardBorder, 0.35) }}
              />
            </>
          ) : (
            <>
              <SelectField
                label="Destination department"
                value={departmentId}
                onChange={onDepartmentChange}
                disabled={submitted}
                searchable={departments.length > 6}
                options={departmentOptions}
              />

              {groups.map(({ group, fields: groupFields }) => (
                <Box key={group.id}>
                  <Typography component="p" variant="caption" sx={groupLabelSx}>
                    {group.label}
                  </Typography>
                  <Box sx={distributionTestFormGridSx}>
                    {groupFields.map((field) => {
                      const multiline = agentDistributionFieldMultiline(
                        field.fieldType,
                        field.fieldKey,
                      );
                      return (
                        <Box
                          key={field.fieldKey}
                          sx={multiline ? distributionTestFormFieldFullSx : undefined}
                        >
                          <DistributionFormField
                            field={field}
                            value={values[field.fieldKey] ?? ""}
                            onChange={(v) => onFieldChange(field.fieldKey, v)}
                            readOnly={submitted}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}

              <Box
                sx={{
                  pt: 2,
                  mt: 0.5,
                  borderTop: `1px solid ${alpha(d.cardBorder, 0.75)}`,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 1.5,
                }}
              >
                {submitted ? (
                  <Typography variant="medium" sx={{ color: d.textMuted, flex: 1 }}>
                    Distribution already submitted for this chat.
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ color: d.textMuted, flex: 1, alignSelf: "center" }}>
                    {deliveryMethod === "crm"
                      ? "Selected department is sent to CRM using your field mapping."
                      : deliveryMethod === "both"
                        ? "Email goes to To/CC/BCC; CRM receives mapped fields including destination department."
                        : "Recipients come from the selected department's To/CC/BCC list."}
                  </Typography>
                )}
                {!submitted ? (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting || departments.length === 0}
                    startIcon={<SendOutlined sx={{ fontSize: 18 }} />}
                    sx={gradientPrimaryButtonSx}
                  >
                    {submitting ? "Sending…" : submitLabel}
                  </Button>
                ) : null}
              </Box>
            </>
          )}
        </Box>
      </DashboardCard>
    </Box>
  );
}
