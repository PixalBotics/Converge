"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Typography } from "@/components/common";
import { pageWrapper } from "@/app/dashboard/dashboard.styles";
import { AgentDistributionFormView } from "@/features/chat-operations/components/AgentDistributionFormView";
import { MarkSpamModal } from "@/features/chat-operations/components/MarkSpamModal";
import type { SpamCategoryValue } from "@/features/chat-operations/utils/chat-close-outcome";
import {
  fetchAgentDistributionForm,
  submitAgentDistribution,
} from "@/services/chat/agent-distribution.api";
import { markClosedConversationSpam } from "@/services/chat/agent-inbox.api";
import { useAccessToken } from "@/lib/auth/use-access-token";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

export function AgentDistributionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId")?.trim() ?? "";
  const accessToken = useAccessToken() ?? "";

  const formQuery = useQuery({
    queryKey: ["agent-distribution-form", conversationId],
    queryFn: () => fetchAgentDistributionForm(conversationId),
    enabled: Boolean(conversationId),
  });

  const [departmentId, setDepartmentId] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [spamModalOpen, setSpamModalOpen] = useState(false);
  const [spamBusy, setSpamBusy] = useState(false);

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
        const submission = res.submission as {
          sent?: number;
          crmSubmitted?: boolean;
          method?: string;
        };
        const sent = Number(submission.sent ?? 0);
        const crmSubmitted = Boolean(submission.crmSubmitted);
        const method = submission.method?.toLowerCase() ?? "email";

        let message = "Distribution submitted.";
        if (method === "both" && sent > 0 && crmSubmitted) {
          message = `Sent to ${sent} email recipient${sent === 1 ? "" : "s"} and CRM.`;
        } else if (method === "crm" && crmSubmitted) {
          message = "Submitted to CRM.";
        } else if (sent > 0) {
          message = `Distribution sent (${sent} recipient${sent === 1 ? "" : "s"}).`;
        }

        publishAppToast({ variant: "success", message });
        router.push("/dashboard/chat-operations");
      })
      .catch((err) => {
        publishAppToast({
          variant: "error",
          message: extractApiErrorMessageForToast(err, "Distribution submit failed."),
        });
      });
  };

  const handleReportSpam = async (input: {
    spamCategory: SpamCategoryValue;
    notes: string;
  }) => {
    setSpamBusy(true);
    try {
      await markClosedConversationSpam(
        conversationId,
        { spamCategory: input.spamCategory, notes: input.notes || undefined },
        accessToken,
      );
      publishAppToast({ variant: "success", message: "Chat marked as spam." });
      router.push("/dashboard/chat-operations");
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err, "Could not mark as spam."),
      });
    } finally {
      setSpamBusy(false);
      setSpamModalOpen(false);
    }
  };

  if (!conversationId) {
    return (
      <Box sx={pageWrapper}>
        <Typography color="error">Missing conversation id.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...pageWrapper, maxWidth: 960, py: 3 }}>
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
        method={payload?.method}
        subject={payload?.subject}
        submitted={submitted}
        submitting={submitMutation.isPending}
        onSubmit={handleSubmit}
        onBack={() => router.push("/dashboard/chat-operations")}
        onReportSpam={submitted ? undefined : () => setSpamModalOpen(true)}
      />
      <MarkSpamModal
        open={spamModalOpen}
        busy={spamBusy}
        onClose={() => !spamBusy && setSpamModalOpen(false)}
        onConfirm={(input) => void handleReportSpam(input)}
      />
    </Box>
  );
}
