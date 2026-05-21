"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Rating from "@mui/material/Rating";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { submitAgentWrapUp } from "@/services/chat/wrap-up.api";
import type {
  AgentWrapUpDisposition,
  AgentWrapUpPayload,
  SubmitAgentWrapUpBody,
} from "@/services/chat/wrap-up.types";
import { DEFAULT_CHAT_OPERATIONS, mergeChatOperationsJson } from "@/services/chat/chat-settings.defaults";
import { fetchWebsiteChatSettings } from "@/services/chat/chat-settings.api";

const DISPOSITIONS: Array<{ value: AgentWrapUpDisposition; label: string }> = [
  { value: "resolved", label: "Resolved" },
  { value: "pending_follow_up", label: "Pending follow-up" },
  { value: "no_response", label: "No response" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
];

interface AgentWrapUpModalProps {
  open: boolean;
  payload: AgentWrapUpPayload | null;
  onClose: () => void;
  onSubmitted: () => void;
}

export function AgentWrapUpModal({ open, payload, onClose, onSubmitted }: AgentWrapUpModalProps) {
  const theme = useTheme() as AppTheme;
  const [disposition, setDisposition] = useState<AgentWrapUpDisposition>("resolved");
  const [agentNotes, setAgentNotes] = useState("");
  const [outcomeTag, setOutcomeTag] = useState("");
  const [csatScore, setCsatScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [csatEnabled, setCsatEnabled] = useState(false);
  const [csatRequired, setCsatRequired] = useState(false);
  const [csatScaleMax, setCsatScaleMax] = useState(5);

  const title =
    payload?.visitorPresentation?.displayName ||
    payload?.visitorPresentation?.inboxTitle ||
    "Visitor";

  useEffect(() => {
    if (!open || !payload?.websiteId) return;
    let cancelled = false;
    void (async () => {
      try {
        const bundle = await fetchWebsiteChatSettings(payload.websiteId!);
        const ops = mergeChatOperationsJson(
          DEFAULT_CHAT_OPERATIONS,
          bundle.settings?.operationsJson ?? DEFAULT_CHAT_OPERATIONS,
        );
        const csat = (ops.csat ?? {}) as Record<string, unknown>;
        if (!cancelled) {
          setCsatEnabled(Boolean(csat.enabled));
          setCsatRequired(Boolean(csat.required));
          setCsatScaleMax(
            typeof csat.scaleMax === "number" && csat.scaleMax > 0 ? csat.scaleMax : 5,
          );
        }
      } catch {
        if (!cancelled) {
          setCsatEnabled(false);
          setCsatRequired(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, payload?.websiteId]);

  useEffect(() => {
    if (!open) {
      setDisposition("resolved");
      setAgentNotes("");
      setOutcomeTag("");
      setCsatScore(null);
    }
  }, [open]);

  const canSubmit = useMemo(() => {
    if (!agentNotes.trim()) return false;
    if (csatEnabled && csatRequired && csatScore == null) return false;
    return true;
  }, [agentNotes, csatEnabled, csatRequired, csatScore]);

  const handleSubmit = async () => {
    if (!payload?.conversationId || !canSubmit) return;
    setSubmitting(true);
    try {
      const body: SubmitAgentWrapUpBody = {
        disposition,
        agentNotes: agentNotes.trim(),
        ...(outcomeTag.trim() ? { outcomeTag: outcomeTag.trim() } : {}),
        ...(csatEnabled && csatScore != null ? { csatScore } : {}),
      };
      await submitAgentWrapUp(payload.conversationId, body);
      onSubmitted();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.app.dashboard.cardBg,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Wrap-up · {title}</DialogTitle>
      <DialogContent>
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
          {payload?.hint ||
            "This chat is complete. Submit disposition and notes — history stays saved."}
        </Typography>

        {payload?.messageCounts ? (
          <Typography variant="caption" sx={{ display: "block", mb: 2, color: theme.app.dashboard.textMuted }}>
            {payload.messageCounts.total} messages · {payload.durationMinutes ?? 0} min
          </Typography>
        ) : null}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Disposition</InputLabel>
            <Select
              label="Disposition"
              value={disposition}
              onChange={(e) => setDisposition(e.target.value as AgentWrapUpDisposition)}
            >
              {(payload?.form?.dispositionOptions?.length
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
            inputProps={{ maxLength: 4000 }}
          />

          <InputField
            label="Outcome tag (optional)"
            value={outcomeTag}
            onChange={(e) => setOutcomeTag(e.target.value)}
          />

          {csatEnabled ? (
            <Box>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                CSAT {csatRequired ? "(required)" : "(optional)"} · 1–{csatScaleMax}
              </Typography>
              <Rating
                value={csatScore}
                onChange={(_, v) => setCsatScore(v)}
                max={csatScaleMax}
                sx={{ mt: 0.5 }}
              />
            </Box>
          ) : null}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button type="button" variant="secondary" disabled={submitting} onClick={onClose}>
          Skip for now
        </Button>
        <Button
          type="button"
          variant="primary"
          sx={gradientPrimaryButtonSx}
          disabled={!canSubmit || submitting}
          onClick={() => void handleSubmit()}
        >
          {submitting ? "Submitting…" : "Submit wrap-up"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
