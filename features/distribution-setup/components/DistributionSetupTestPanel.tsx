"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useMutation } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import { Button, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { EmailFormFieldRow } from "@/api/email/email-forms.api";
import { sendDistributionTestEmail } from "@/api/distribution/distribution-setup.api";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { buildDistributionTestFormValues } from "../utils/test-form-values";
import {
  distributionTestRecipientsCardSx,
  distributionTestTopRowSx,
} from "../styles/distribution-wizard-ui.styles";
import { DistributionTestFormFieldsPreview } from "./DistributionTestFormFieldsPreview";

export type DistributionSetupTestDepartment = {
  name: string;
  to: string;
  cc: string;
  bcc: string;
};

export type DistributionSetupTestPanelHandle = {
  sendTest: () => void;
  canSend: boolean;
  isSending: boolean;
};

function splitEmails(value: string): string[] {
  return value
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function RecipientLine({ label, emails }: { label: string; emails: string[] }) {
  const theme = useTheme() as AppTheme;
  if (!emails.length) return null;
  return (
    <Box sx={{ mb: 0.85, "&:last-of-type": { mb: 0 } }}>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.primary.light,
          fontWeight: 700,
          display: "block",
          mb: 0.25,
          fontSize: 11,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="small"
        sx={{
          color: theme.app.text.primary,
          wordBreak: "break-all",
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        {emails.join(", ")}
      </Typography>
    </Box>
  );
}

export type DistributionTestSendState = {
  canSend: boolean;
  isSending: boolean;
};

export type DistributionSetupTestPanelProps = {
  websiteId: string;
  subject: string;
  emailConfigurationId?: string | null;
  departments: DistributionSetupTestDepartment[];
  formFields?: EmailFormFieldRow[];
  /** When false, send is triggered from the wizard footer only. */
  showInlineSendButton?: boolean;
  onSendStateChange?: (state: DistributionTestSendState) => void;
};

export const DistributionSetupTestPanel = forwardRef<
  DistributionSetupTestPanelHandle,
  DistributionSetupTestPanelProps
>(function DistributionSetupTestPanel(
  {
    websiteId,
    subject,
    emailConfigurationId,
    departments,
    formFields = [],
    showInlineSendButton = true,
    onSendStateChange,
  },
  ref,
) {
  const theme = useTheme() as AppTheme;
  const [departmentName, setDepartmentName] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>(() =>
    buildDistributionTestFormValues(formFields),
  );

  useEffect(() => {
    setFormValues((prev) => {
      const next = buildDistributionTestFormValues(formFields);
      for (const key of Object.keys(next)) {
        if (prev[key] !== undefined) next[key] = prev[key];
      }
      return next;
    });
  }, [formFields]);

  const departmentOptions = departments
    .filter((d) => d.name.trim())
    .map((d) => ({ label: d.name, value: d.name }));

  const selected = useMemo(
    () => departments.find((d) => d.name === departmentName),
    [departments, departmentName],
  );

  const toList = useMemo(() => splitEmails(selected?.to ?? ""), [selected?.to]);
  const ccList = useMemo(() => splitEmails(selected?.cc ?? ""), [selected?.cc]);
  const bccList = useMemo(() => splitEmails(selected?.bcc ?? ""), [selected?.bcc]);
  const hasRecipients = toList.length + ccList.length + bccList.length > 0;

  useEffect(() => {
    const first = departments.find((d) => {
      if (!d.name.trim()) return false;
      return splitEmails(d.to).length + splitEmails(d.cc).length + splitEmails(d.bcc).length > 0;
    });
    if (first) setDepartmentName(first.name);
  }, [departments]);

  const sendMutation = useMutation({
    mutationFn: (values: Record<string, string>) =>
      sendDistributionTestEmail({
        websiteId,
        subject: subject.trim() || "Distribution test",
        departmentName: departmentName.trim(),
        emailConfigurationId: emailConfigurationId ?? undefined,
        formValues: values,
      }),
  });

  const handleFieldChange = (fieldKey: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleSend = () => {
    if (!departmentName.trim()) {
      publishAppToast({ variant: "error", message: "Select a distribution department." });
      return;
    }
    if (!hasRecipients) {
      publishAppToast({
        variant: "error",
        message: "Add To, CC, or BCC emails for this department on the previous step.",
      });
      return;
    }
    void sendMutation
      .mutateAsync(formValues)
      .then((res) => {
        const parts: string[] = [];
        if (res.to.length) parts.push(`To: ${res.to.join(", ")}`);
        if (res.cc.length) parts.push(`CC: ${res.cc.join(", ")}`);
        if (res.bcc.length) parts.push(`BCC: ${res.bcc.length} hidden`);
        publishAppToast({
          variant: "success",
          message: `Test email sent (${res.recipientCount} recipient${res.recipientCount === 1 ? "" : "s"}). ${parts.join(" · ")}`,
        });
      })
      .catch((err) => {
        publishAppToast({
          variant: "error",
          message: extractApiErrorMessageForToast(err, "Test send failed."),
        });
      });
  };

  const canSend =
    Boolean(departmentName.trim()) && hasRecipients && !sendMutation.isPending;

  useImperativeHandle(ref, () => ({
    sendTest: handleSend,
    canSend,
    isSending: sendMutation.isPending,
  }));

  useEffect(() => {
    onSendStateChange?.({ canSend, isSending: sendMutation.isPending });
  }, [canSend, sendMutation.isPending, onSendStateChange]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
        Choose a department, review recipients, edit field values, then send a test email.
      </Typography>

      {!departmentOptions.length ? (
        <Typography variant="medium" sx={{ color: theme.palette.warning.main }}>
          No departments found. Go back to the Recipients step, add at least one department with
          To/CC/BCC emails, then return here.
        </Typography>
      ) : null}

      <Box sx={distributionTestTopRowSx}>
        <SelectField
          label="Distribution department"
          value={departmentName}
          onChange={setDepartmentName}
          options={
            departmentOptions.length
              ? departmentOptions
              : [{ label: "Add departments on the previous step", value: "" }]
          }
        />

        {selected ? (
          <Box sx={distributionTestRecipientsCardSx}>
            <Typography
              variant="caption"
              sx={{
                color: theme.app.dashboard.textMuted,
                display: "block",
                mb: 1,
                fontWeight: 600,
              }}
            >
              Recipients for this test (from your setup)
            </Typography>
            <RecipientLine label="To" emails={toList} />
            <RecipientLine label="CC" emails={ccList} />
            <RecipientLine label="BCC" emails={bccList} />
            {!hasRecipients ? (
              <Typography variant="caption" sx={{ color: theme.palette.warning.light }}>
                No recipients on this department — go back and add emails in the table.
              </Typography>
            ) : null}
          </Box>
        ) : null}
      </Box>

      {formFields.some((f) => f.enabled) ? (
        <DistributionTestFormFieldsPreview
          fields={formFields}
          values={formValues}
          onFieldChange={handleFieldChange}
        />
      ) : null}

      {showInlineSendButton ? (
        <Button
          type="button"
          variant="primary"
          sx={{ ...gradientPrimaryButtonSx, alignSelf: "flex-start" }}
          disabled={!canSend}
          onClick={handleSend}
        >
          {sendMutation.isPending ? "Sending…" : "Send test email"}
        </Button>
      ) : null}
    </Box>
  );
});
