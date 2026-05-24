"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  InputField,
  SelectField,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { pageWrapper } from "@/app/dashboard/dashboard.styles";
import {
  fetchAgentDistributionForm,
  submitAgentDistribution,
  type AgentDistributionFormField,
} from "@/services/chat/agent-distribution.api";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

function fieldMultiline(fieldType: string): boolean {
  const t = fieldType.toLowerCase();
  return t === "textarea" || t === "multiline" || fieldKeyIsLongText(fieldType);
}

function fieldKeyIsLongText(fieldKey: string): boolean {
  return fieldKey === "transcript" || fieldKey === "journey" || fieldKey === "notes";
}

function DistributionFieldInput({
  field,
  value,
  onChange,
  readOnly,
}: {
  field: AgentDistributionFormField;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  const multiline = fieldMultiline(field.fieldType) || fieldKeyIsLongText(field.fieldKey);
  return (
    <InputField
      label={field.label}
      name={field.fieldKey}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      multiline={multiline}
      minRows={multiline ? 4 : undefined}
      disabled={readOnly}
    />
  );
}

export function AgentDistributionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId")?.trim() ?? "";

  const formQuery = useQuery({
    queryKey: ["agent-distribution-form", conversationId],
    queryFn: () => fetchAgentDistributionForm(conversationId),
    enabled: Boolean(conversationId),
  });

  const [departmentId, setDepartmentId] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  const payload = formQuery.data;
  const submitted = Boolean(payload?.submitted);

  useEffect(() => {
    if (!payload) return;
    setValues({ ...payload.prefilledValues });
    if (!departmentId && payload.departments.length) {
      setDepartmentId(payload.departments[0].id);
    }
  }, [payload, departmentId]);

  const visibleFields = useMemo(
    () => (payload?.fields ?? []).filter((f) => f.enabled || f.isRequired),
    [payload?.fields],
  );

  const submitMutation = useMutation({
    mutationFn: () =>
      submitAgentDistribution(conversationId, {
        distributionDepartmentId: departmentId,
        formValues: values,
        subject: payload?.subject,
      }),
  });

  const handleSubmit = () => {
    if (!departmentId.trim()) {
      publishAppToast({ variant: "error", message: "Select a distribution department." });
      return;
    }
    void submitMutation
      .mutateAsync()
      .then((res) => {
        const sent = Number(
          (res.submission as { sent?: number }).sent ?? 0,
        );
        publishAppToast({
          variant: "success",
          message:
            sent > 0
              ? `Distribution sent (${sent} recipient${sent === 1 ? "" : "s"}).`
              : "Distribution submitted.",
        });
        router.push("/dashboard/chat-operations");
      })
      .catch((err) => {
        publishAppToast({
          variant: "error",
          message: extractApiErrorMessageForToast(err, "Distribution submit failed."),
        });
      });
  };

  if (!conversationId) {
    return (
      <Box sx={pageWrapper}>
        <Typography color="error">Missing conversation id.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...pageWrapper, maxWidth: 720, mx: "auto", py: 3 }}>
      <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
        Distribute chat transcript
      </Typography>
      <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted, mb: 3 }}>
        Fields below are filled automatically from the chat. Choose the distribution department and
        submit.
      </Typography>

      {formQuery.isLoading ? (
        <Typography sx={{ color: (t) => t.app.dashboard.textMuted }}>Loading form…</Typography>
      ) : formQuery.isError ? (
        <Typography sx={{ color: (t) => t.palette.error.main }}>
          {extractApiErrorMessageForToast(
            formQuery.error,
            "Could not load distribution form for this chat.",
          )}
        </Typography>
      ) : payload ? (
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!submitted) handleSubmit();
          }}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <SelectField
            label="Distribution department"
            value={departmentId}
            onChange={setDepartmentId}
            disabled={submitted}
            options={payload.departments.map((d) => ({
              value: d.id,
              label: `${d.name} (${d.recipientCount} recipient${d.recipientCount === 1 ? "" : "s"})`,
            }))}
          />

          {visibleFields.map((field) => (
            <DistributionFieldInput
              key={field.fieldKey}
              field={field}
              value={values[field.fieldKey] ?? ""}
              onChange={(v) => setValues((prev) => ({ ...prev, [field.fieldKey]: v }))}
              readOnly={submitted || field.readOnly}
            />
          ))}

          <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Back
            </Button>
            {!submitted ? (
              <Button
                type="submit"
                variant="primary"
                sx={gradientPrimaryButtonSx}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? "Sending…" : "Submit distribution"}
              </Button>
            ) : (
              <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted, alignSelf: "center" }}>
                Already submitted for this chat.
              </Typography>
            )}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
