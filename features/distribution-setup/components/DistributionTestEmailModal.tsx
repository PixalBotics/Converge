"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useMutation } from "@tanstack/react-query";
import { FormModal, InputField, SelectField, Typography } from "@/components/common";
import { sendDistributionTestEmail } from "@/api/distribution/distribution-setup.api";
import type { EmailFormFieldRow } from "@/api/email/email-forms.api";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

export type DistributionTestDepartment = {
  name: string;
  to: string;
};

export type DistributionTestEmailModalProps = {
  open: boolean;
  onClose: () => void;
  websiteId: string;
  subject: string;
  emailConfigurationId?: string | null;
  fields: EmailFormFieldRow[];
  departments: DistributionTestDepartment[];
};

export function DistributionTestEmailModal({
  open,
  onClose,
  websiteId,
  subject,
  emailConfigurationId,
  fields,
  departments,
}: DistributionTestEmailModalProps) {
  const enabledFields = useMemo(
    () => fields.filter((f) => f.enabled || f.isRequired),
    [fields],
  );

  const [departmentName, setDepartmentName] = useState("");
  const [to, setTo] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const first = departments.find((d) => d.name.trim() && d.to.trim());
    if (first) {
      setDepartmentName(first.name);
      setTo(first.to);
    }
    const initial: Record<string, string> = {};
    for (const f of enabledFields) {
      initial[f.fieldKey] = "";
    }
    setValues(initial);
  }, [open, departments, enabledFields]);

  const sendMutation = useMutation({
    mutationFn: () =>
      sendDistributionTestEmail({
        websiteId,
        subject: subject.trim() || "Distribution test",
        departmentName: departmentName.trim(),
        to: to.trim(),
        emailConfigurationId: emailConfigurationId ?? undefined,
        formValues: values,
      }),
  });

  const departmentOptions = departments
    .filter((d) => d.name.trim())
    .map((d) => ({ label: d.name, value: d.name }));

  const handleSend = () => {
    void sendMutation.mutateAsync().then((res) => {
      publishAppToast({
        variant: "success",
        message: `Test email sent to ${res.to}.`,
      });
      onClose();
    }).catch((err) => {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err, "Test send failed."),
      });
    });
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSave={handleSend}
      title="Send test email"
      description="Fill the wrap-up form and send to one department recipient."
      primaryButtonLabel={sendMutation.isPending ? "Sending…" : "Send test"}
      primaryButtonDisabled={
        sendMutation.isPending || !to.trim() || !departmentName.trim()
      }
      maxWidth={560}
      fitContent
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <SelectField
          label="Department"
          value={departmentName}
          onChange={(name) => {
            setDepartmentName(name);
            const match = departments.find((d) => d.name === name);
            if (match?.to) setTo(match.to);
          }}
          options={departmentOptions.length ? departmentOptions : [{ label: "—", value: "" }]}
        />
        <InputField
          label="Send to"
          name="to"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="recipient@company.com"
        />
        <Typography variant="small" fontWeight={600}>
          Form preview (test values)
        </Typography>
        {enabledFields.map((field) => (
          <InputField
            key={field.fieldKey}
            label={field.label}
            name={field.fieldKey}
            value={values[field.fieldKey] ?? ""}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [field.fieldKey]: e.target.value }))
            }
            required={field.isRequired}
          />
        ))}
        {enabledFields.length === 0 ? (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            No email form configured for this website. Set one under Email Configuration → Email forms.
          </Typography>
        ) : null}
      </Box>
    </FormModal>
  );
}
