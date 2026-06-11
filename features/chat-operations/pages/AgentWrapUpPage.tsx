"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Rating from "@mui/material/Rating";
import Select from "@mui/material/Select";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  InputField,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { pageWrapper } from "@/app/dashboard/dashboard.styles";
import {
  fetchAgentWrapUp,
  submitAgentWrapUp,
} from "@/services/chat/wrap-up.api";
import type {
  AgentWrapUpDisposition,
  AgentWrapUpEmailField,
} from "@/services/chat/wrap-up.types";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { useAuth } from "@/lib/auth";
import { canWidgetSettingsFromArrays } from "@/lib/permissions/chat-access";
import { DEFAULT_CHAT_OPERATIONS, mergeChatOperationsJson } from "@/services/chat/chat-settings.defaults";
import { fetchWebsiteChatSettings } from "@/services/chat/chat-settings.api";

const DISPOSITIONS: Array<{ value: AgentWrapUpDisposition; label: string }> = [
  { value: "resolved", label: "Resolved" },
  { value: "pending_follow_up", label: "Pending follow-up" },
  { value: "no_response", label: "No response" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
];

function fieldMultiline(fieldType: string, fieldKey: string): boolean {
  const t = fieldType.toLowerCase();
  return (
    t === "textarea" ||
    t === "multiline" ||
    fieldKey === "transcript" ||
    fieldKey === "journey" ||
    fieldKey === "notes" ||
    fieldKey === "additional_notes"
  );
}

function WrapUpFieldInput({
  field,
  value,
  onChange,
  readOnly,
}: {
  field: AgentWrapUpEmailField;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  const multiline = fieldMultiline(field.fieldType, field.fieldKey);
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

export function AgentWrapUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId")?.trim() ?? "";
  const { pagePermissions, operationalPermissions, isPlatformAdmin } = useAuth();
  const canLoadWidgetSettings = canWidgetSettingsFromArrays({
    page: pagePermissions,
    operational: operationalPermissions,
    isPlatformAdmin,
  });

  const formQuery = useQuery({
    queryKey: ["agent-wrap-up-form", conversationId],
    queryFn: () => fetchAgentWrapUp(conversationId),
    enabled: Boolean(conversationId),
  });

  const [disposition, setDisposition] = useState<AgentWrapUpDisposition>("resolved");
  const [agentNotes, setAgentNotes] = useState("");
  const [outcomeTag, setOutcomeTag] = useState("");
  const [csatScore, setCsatScore] = useState<number | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [csatEnabled, setCsatEnabled] = useState(false);
  const [csatRequired, setCsatRequired] = useState(false);
  const [csatScaleMax, setCsatScaleMax] = useState(5);

  const payload = formQuery.data;
  const submitted = Boolean(payload?.wrapUpSubmitted);
  const visitorLabel =
    payload?.visitorPresentation?.displayName ||
    payload?.visitorPresentation?.inboxTitle ||
    "Visitor";

  useEffect(() => {
    if (!payload || !conversationId) return;
    if (payload.requiresDistributionForm) {
      const href =
        payload.distributionFormPath ??
        `/dashboard/chat-operations/distribution?conversationId=${encodeURIComponent(conversationId)}`;
      router.replace(href);
      return;
    }
    if (payload.requiresDistributionSetup && payload.websiteId) {
      const href =
        payload.distributionSetupPath ??
        `/dashboard/distribution-setup/settings?websiteId=${encodeURIComponent(payload.websiteId)}`;
      router.replace(href);
      return;
    }
    router.replace("/dashboard/chat-operations");
  }, [
    conversationId,
    payload,
    router,
  ]);

  useEffect(() => {
    if (!payload?.closeForm?.prefilledValues) return;
    setValues({ ...payload.closeForm.prefilledValues });
  }, [payload?.closeForm?.prefilledValues]);

  useEffect(() => {
    if (!payload?.websiteId) return;
    let cancelled = false;
    const applyCsatFromOps = (ops: ReturnType<typeof mergeChatOperationsJson>) => {
      const csat = (ops.csat ?? {}) as Record<string, unknown>;
      setCsatEnabled(Boolean(csat.enabled));
      setCsatRequired(Boolean(csat.required));
      setCsatScaleMax(typeof csat.scaleMax === "number" && csat.scaleMax > 0 ? csat.scaleMax : 5);
    };
    if (!canLoadWidgetSettings) {
      applyCsatFromOps(DEFAULT_CHAT_OPERATIONS);
      return;
    }
    void (async () => {
      try {
        const bundle = await fetchWebsiteChatSettings(payload.websiteId!);
        const ops = mergeChatOperationsJson(
          DEFAULT_CHAT_OPERATIONS,
          bundle.settings?.operationsJson ?? DEFAULT_CHAT_OPERATIONS,
        );
        if (!cancelled) applyCsatFromOps(ops);
      } catch {
        if (!cancelled) applyCsatFromOps(DEFAULT_CHAT_OPERATIONS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canLoadWidgetSettings, payload?.websiteId]);

  const visibleFields = useMemo(
    () =>
      (payload?.closeForm?.fields ?? []).filter((f) => f.enabled || f.isRequired),
    [payload?.closeForm?.fields],
  );

  const submitMutation = useMutation({
    mutationFn: () =>
      submitAgentWrapUp(conversationId, {
        disposition,
        agentNotes: agentNotes.trim(),
        ...(outcomeTag.trim() ? { outcomeTag: outcomeTag.trim() } : {}),
        ...(csatEnabled && csatScore != null ? { csatScore } : {}),
        formValues: values,
      }),
  });

  const canSubmit = useMemo(() => {
    if (!agentNotes.trim()) return false;
    if (csatEnabled && csatRequired && csatScore == null) return false;
    return true;
  }, [agentNotes, csatEnabled, csatRequired, csatScore]);

  const handleSubmit = () => {
    if (!canSubmit) {
      publishAppToast({ variant: "error", message: "Add agent notes before submitting." });
      return;
    }
    void submitMutation
      .mutateAsync()
      .then(() => {
        publishAppToast({
          variant: "success",
          message: "Wrap-up submitted successfully.",
        });
        router.push("/dashboard/chat-operations");
      })
      .catch((err) => {
        publishAppToast({
          variant: "error",
          message: extractApiErrorMessageForToast(err, "Wrap-up submission failed."),
        });
      });
  };

  if (!conversationId) {
    return (
      <Box sx={pageWrapper}>
        <Typography color="error">Missing conversation ID.</Typography>
      </Box>
    );
  }

  if (formQuery.isSuccess && payload) {
    return (
      <Box sx={pageWrapper}>
        <Typography sx={{ color: (t) => t.app.dashboard.textMuted }}>
          {payload.requiresDistributionForm
            ? "Redirecting to distribution form…"
            : payload.requiresDistributionSetup
              ? "Redirecting to distribution setup…"
              : "Redirecting to chat operations…"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...pageWrapper, maxWidth: 720, mx: "auto", py: 3 }}>
      <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
        Post-close wrap-up · {visitorLabel}
      </Typography>
      <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted, mb: 3 }}>
        Review the session details below, record disposition and notes, then submit. The chat
        transcript remains saved in history.
      </Typography>

      {formQuery.isLoading ? (
        <Typography sx={{ color: (t) => t.app.dashboard.textMuted }}>Loading form…</Typography>
      ) : formQuery.isError ? (
        <Typography sx={{ color: (t) => t.palette.error.main }}>
          {extractApiErrorMessageForToast(
            formQuery.error,
            "Could not load the post-close form for this chat.",
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
          {payload.messageCounts ? (
            <Typography variant="caption" sx={{ color: (t) => t.app.dashboard.textMuted }}>
              {payload.messageCounts.total} messages · {payload.durationMinutes ?? 0} min session
            </Typography>
          ) : null}

          <FormControl fullWidth size="small">
            <InputLabel>Disposition</InputLabel>
            <Select
              label="Disposition"
              value={disposition}
              disabled={submitted}
              onChange={(e) => setDisposition(e.target.value as AgentWrapUpDisposition)}
            >
              {(payload.form?.dispositionOptions?.length
                ? payload.form.dispositionOptions
                : DISPOSITIONS
              ).map((d) => (
                <MenuItem key={d.value} value={d.value}>
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <InputField
            label="Agent notes"
            value={agentNotes}
            onChange={(e) => setAgentNotes(e.target.value)}
            multiline
            minRows={3}
            disabled={submitted}
            inputProps={{ maxLength: 4000 }}
          />

          <InputField
            label="Outcome tag (optional)"
            value={outcomeTag}
            onChange={(e) => setOutcomeTag(e.target.value)}
            disabled={submitted}
          />

          {csatEnabled ? (
            <Box>
              <Typography variant="caption" sx={{ color: (t) => t.app.dashboard.textMuted }}>
                CSAT {csatRequired ? "(required)" : "(optional)"} · 1–{csatScaleMax}
              </Typography>
              <Rating
                value={csatScore}
                onChange={(_, v) => setCsatScore(v)}
                max={csatScaleMax}
                disabled={submitted}
                sx={{ mt: 0.5 }}
              />
            </Box>
          ) : null}

          {visibleFields.length > 0 ? (
            <>
              <Typography variant="medium" fontWeight={600} sx={{ mt: 1, color: "white" }}>
                Session fields
              </Typography>
              {visibleFields.map((field) => (
                <WrapUpFieldInput
                  key={field.fieldKey}
                  field={field}
                  value={values[field.fieldKey] ?? ""}
                  onChange={(v) => setValues((prev) => ({ ...prev, [field.fieldKey]: v }))}
                  readOnly={submitted || field.readOnly}
                />
              ))}
            </>
          ) : null}

          <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Back to inbox
            </Button>
            {!submitted ? (
              <Button
                type="submit"
                variant="primary"
                sx={gradientPrimaryButtonSx}
                disabled={submitMutation.isPending || !canSubmit}
              >
                {submitMutation.isPending ? "Submitting…" : "Submit"}
              </Button>
            ) : (
              <Typography
                variant="medium"
                sx={{ color: (t) => t.app.dashboard.textMuted, alignSelf: "center" }}
              >
                Wrap-up already submitted for this chat.
              </Typography>
            )}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
