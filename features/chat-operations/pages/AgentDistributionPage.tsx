"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Typography } from "@/components/common";
import { pageWrapper } from "@/app/dashboard/dashboard.styles";
import { AgentDistributionFormView } from "@/features/chat-operations/components/AgentDistributionFormView";
import {
  fetchAgentDistributionForm,
  submitAgentDistribution,
} from "@/services/chat/agent-distribution.api";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

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
        const sent = Number((res.submission as { sent?: number }).sent ?? 0);
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
    <Box sx={{ ...pageWrapper, maxWidth: 720, mx: "auto", py: 3, px: { xs: 1.5, sm: 2 } }}>
      {formQuery.isError ? (
        <Typography sx={{ color: (t) => t.palette.error.main, mb: 2 }}>
          {extractApiErrorMessageForToast(
            formQuery.error,
            "Could not load distribution form for this chat.",
          )}
        </Typography>
      ) : null}

      <AgentDistributionFormView
        loading={formQuery.isLoading}
        fields={visibleFields}
        values={values}
        onFieldChange={(fieldKey, value) =>
          setValues((prev) => ({ ...prev, [fieldKey]: value }))
        }
        departments={payload?.departments ?? []}
        departmentId={departmentId}
        onDepartmentChange={setDepartmentId}
        subject={payload?.subject}
        submitted={submitted}
        submitting={submitMutation.isPending}
        onSubmit={handleSubmit}
        onBack={() => router.push("/dashboard/chat-operations")}
      />
    </Box>
  );
}
