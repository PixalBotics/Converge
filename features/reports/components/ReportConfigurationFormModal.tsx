"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  FormModal,
  InputField,
  SelectField,
  Typography,
} from "@/components/common";
import { websiteAssignmentFilterGrid } from "@/app/dashboard/website-assigning/website-assigning.styles";
import type { ReportConfiguration, ReportType } from "@/api/reports/reports.types";
import { useChatScopeFilters } from "@/features/chat-shared";
import {
  DAY_OF_WEEK_OPTIONS,
  RECIPIENT_TYPE_OPTIONS,
  REPORT_TYPE_OPTIONS,
  SCHEDULE_TYPE_OPTIONS,
} from "../reports.constants";
import { hasReportScope } from "../utils/report-params";

type RecipientDraft = { email: string; recipientType: string };

export type ReportConfigurationFormModalProps = {
  open: boolean;
  onClose: () => void;
  configuration?: ReportConfiguration | null;
  onSubmit: (payload: {
    scope: {
      resellerId?: string;
      parentCompanyId?: string;
      companyId?: string;
      websiteId?: string;
    };
    reportType: string;
    recipients: RecipientDraft[];
    schedule: {
      scheduleType: "weekly" | "monthly";
      dayOfMonth?: number;
      dayOfWeek?: number;
      scheduleTime: string;
      isActive: boolean;
    };
  }) => Promise<void>;
  submitting: boolean;
};

export function ReportConfigurationFormModal({
  open,
  onClose,
  configuration,
  onSubmit,
  submitting,
}: ReportConfigurationFormModalProps) {
  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled: open });
  const [reportType, setReportType] = useState<ReportType>("monthly_chat_summary");
  const [recipients, setRecipients] = useState<RecipientDraft[]>([{ email: "", recipientType: "to" }]);
  const [scheduleType, setScheduleType] = useState<"weekly" | "monthly">("monthly");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [scheduleTime, setScheduleTime] = useState("09:00:00");
  const [scheduleActive, setScheduleActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (configuration) {
      scopeFilters.patchFilters({
        resellerId: configuration.scope.resellerId ?? "",
        parentCompanyId: configuration.scope.parentCompanyId ?? "",
        childCompanyId: configuration.scope.companyId ?? "",
        websiteId: configuration.scope.websiteId ?? "",
      });
      setReportType(configuration.reportType);
      setRecipients(
        configuration.recipients.length > 0
          ? configuration.recipients.map((r) => ({
              email: r.email,
              recipientType: r.recipientType ?? "to",
            }))
          : [{ email: "", recipientType: "to" }],
      );
      const schedule = configuration.schedules[0];
      if (schedule) {
        setScheduleType((schedule.scheduleType as "weekly" | "monthly") ?? "monthly");
        setDayOfMonth(String(schedule.dayOfMonth ?? 1));
        setDayOfWeek(String(schedule.dayOfWeek ?? 1));
        setScheduleTime(schedule.scheduleTime ?? "09:00:00");
        setScheduleActive(schedule.isActive);
      }
    } else {
      scopeFilters.resetFilters();
      setReportType("monthly_chat_summary");
      setRecipients([{ email: "", recipientType: "to" }]);
      setScheduleType("monthly");
      setDayOfMonth("1");
      setDayOfWeek("1");
      setScheduleTime("09:00:00");
      setScheduleActive(true);
    }
  }, [open, configuration]);

  const scopeInput = {
    resellerId: scopeFilters.filters.resellerId,
    parentCompanyId: scopeFilters.filters.parentCompanyId,
    childCompanyId: scopeFilters.filters.childCompanyId,
    websiteId: scopeFilters.filters.websiteId,
  };

  const validRecipients = recipients.filter((r) => r.email.trim());
  const canSave =
    hasReportScope(scopeInput) &&
    validRecipients.length > 0 &&
    scheduleTime.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSave) return;
    await onSubmit({
      scope: {
        resellerId: scopeInput.resellerId.trim() || undefined,
        parentCompanyId: scopeInput.parentCompanyId.trim() || undefined,
        companyId: scopeInput.childCompanyId.trim() || undefined,
        websiteId: scopeInput.websiteId.trim() || undefined,
      },
      reportType,
      recipients: validRecipients,
      schedule: {
        scheduleType,
        ...(scheduleType === "monthly"
          ? { dayOfMonth: Number(dayOfMonth) || 1 }
          : { dayOfWeek: Number(dayOfWeek) || 1 }),
        scheduleTime: scheduleTime.trim(),
        isActive: scheduleActive,
      },
    });
  };

  const selectedReportType = REPORT_TYPE_OPTIONS.find((o) => o.value === reportType);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={configuration ? "Edit report configuration" : "Create report configuration"}
      maxWidth={720}
      fitContent
      primaryButtonLabel={
        submitting ? "Saving…" : configuration ? "Save changes" : "Create"
      }
      primaryButtonDisabled={!canSave || submitting}
      onSave={() => void handleSubmit()}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <SelectField
          label="Report type"
          value={reportType}
          onChange={(v) => setReportType(v as ReportType)}
          options={REPORT_TYPE_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
        />
        {selectedReportType ? (
          <Typography variant="caption" sx={{ opacity: 0.75, mt: -1 }}>
            {selectedReportType.description}
          </Typography>
        ) : null}

        <Typography fontWeight={600}>Scope</Typography>
        <Box sx={websiteAssignmentFilterGrid}>
          {scopeFilters.canFilterByResellerId ? (
            <SelectField
              label="Reseller"
              value={scopeFilters.filters.resellerId}
              onChange={(v) => scopeFilters.patchFilters({ resellerId: v })}
              options={scopeFilters.resellerOptions}
            />
          ) : null}
          <SelectField
            label="Parent company"
            value={scopeFilters.filters.parentCompanyId}
            onChange={(v) => scopeFilters.patchFilters({ parentCompanyId: v })}
            options={scopeFilters.parentCompanyOptions}
          />
          <SelectField
            label="Child company"
            value={scopeFilters.filters.childCompanyId}
            onChange={(v) => scopeFilters.patchFilters({ childCompanyId: v })}
            options={scopeFilters.childCompanyOptions}
          />
          <SelectField
            label="Website"
            value={scopeFilters.filters.websiteId}
            onChange={(v) => scopeFilters.patchFilters({ websiteId: v })}
            options={scopeFilters.websiteOptions}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography fontWeight={600}>Recipients</Typography>
          <IconButton
            size="small"
            aria-label="Add recipient"
            onClick={() => setRecipients((p) => [...p, { email: "", recipientType: "to" }])}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
        {recipients.map((recipient, index) => (
          <Box key={index} sx={{ display: "grid", gridTemplateColumns: "1fr 120px 40px", gap: 1 }}>
            <InputField
              label={index === 0 ? "Email" : ""}
              value={recipient.email}
              onChange={(e) =>
                setRecipients((p) =>
                  p.map((r, i) => (i === index ? { ...r, email: e.target.value } : r)),
                )
              }
              placeholder="reports@company.com"
            />
            <SelectField
              label={index === 0 ? "Type" : ""}
              value={recipient.recipientType}
              onChange={(v) =>
                setRecipients((p) =>
                  p.map((r, i) => (i === index ? { ...r, recipientType: v } : r)),
                )
              }
              options={[...RECIPIENT_TYPE_OPTIONS]}
            />
            <Box sx={{ display: "flex", alignItems: index === 0 ? "flex-end" : "center" }}>
              <IconButton
                size="small"
                aria-label="Remove recipient"
                disabled={recipients.length <= 1}
                onClick={() => setRecipients((p) => p.filter((_, i) => i !== index))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}

        <Typography fontWeight={600}>Schedule</Typography>
        <Box sx={websiteAssignmentFilterGrid}>
          <SelectField
            label="Schedule type"
            value={scheduleType}
            onChange={(v) => setScheduleType(v as "weekly" | "monthly")}
            options={[...SCHEDULE_TYPE_OPTIONS]}
          />
          {scheduleType === "monthly" ? (
            <InputField
              label="Day of month (1–28)"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              type="number"
            />
          ) : (
            <SelectField
              label="Day of week"
              value={dayOfWeek}
              onChange={setDayOfWeek}
              options={[...DAY_OF_WEEK_OPTIONS]}
            />
          )}
          <InputField
            label="Time (HH:mm:ss)"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            placeholder="09:00:00"
          />
          <SelectField
            label="Active"
            value={scheduleActive ? "yes" : "no"}
            onChange={(v) => setScheduleActive(v === "yes")}
            options={[
              { value: "yes", label: "Active" },
              { value: "no", label: "Inactive" },
            ]}
          />
        </Box>
      </Box>
    </FormModal>
  );
}
