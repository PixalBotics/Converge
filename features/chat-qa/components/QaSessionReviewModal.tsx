"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";
import Rating from "@mui/material/Rating";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, FormModal, InputField, Typography } from "@/components/common";
import type { QaReviewBundle, UpsertQaSessionReviewBody } from "@/services/chat/qa.types";
import { qaUserDisplay, serviceChannelLabel } from "../utils/qa-user-display";
import {
  buildQaSessionReviewBody,
  QA_SESSION_CHECKLIST_KEYS,
  readQaChecklist,
} from "../utils/qa-session-review.shared";

interface QaSessionReviewModalProps {
  open: boolean;
  onClose: () => void;
  bundle: QaReviewBundle | null;
  canEdit: boolean;
  saving?: boolean;
  onSave: (body: UpsertQaSessionReviewBody) => Promise<void>;
}

export function QaSessionReviewModal({
  open,
  onClose,
  bundle,
  canEdit,
  saving = false,
  onSave,
}: QaSessionReviewModalProps) {
  const theme = useTheme() as AppTheme;
  const review = bundle?.review ?? null;
  const summary = bundle?.sessionSummary ?? null;

  const [starRating, setStarRating] = useState<number | null>(3);
  const [failureReason, setFailureReason] = useState("");
  const [overallScore, setOverallScore] = useState(80);
  const [summaryText, setSummaryText] = useState("");
  const [coachingNotes, setCoachingNotes] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [meaningfulChat, setMeaningfulChat] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!review) {
      setStarRating(3);
      setFailureReason("");
      setOverallScore(80);
      setSummaryText("");
      setCoachingNotes("");
      setChecklist(readQaChecklist(null));
      setMeaningfulChat(false);
      return;
    }
    setStarRating(review.starRating ?? null);
    setFailureReason(review.failureReason ?? "");
    setOverallScore(review.overallScore ?? 80);
    setSummaryText(review.summary ?? "");
    setCoachingNotes(review.coachingNotes ?? "");
    setChecklist(readQaChecklist(review.checklistJson ?? null));
  }, [
    open,
    review?.id,
    review?.starRating,
    review?.failureReason,
    review?.overallScore,
    review?.summary,
    review?.coachingNotes,
    review?.checklistJson,
  ]);

  const formFields = useMemo(
    () => ({
      starRating,
      failureReason,
      overallScore,
      summary: summaryText,
      coachingNotes,
      checklist,
      meaningfulChat,
    }),
    [starRating, failureReason, overallScore, summaryText, coachingNotes, checklist, meaningfulChat],
  );

  const isCompleted = review?.status === "completed";
  const workflowStatus = isCompleted
    ? "completed"
    : review?.status === "pending"
      ? "pending"
      : "in_progress";
  const readOnly = !canEdit || isCompleted;
  const d = theme.app.dashboard;

  const workflowChipColor =
    workflowStatus === "completed"
      ? d.accentBlue
      : workflowStatus === "in_progress"
        ? d.accentViolet
        : d.accentOrange;

  const description = useMemo(() => {
    const parts: string[] = [];
    if (summary?.website?.label) parts.push(summary.website.label);
    if (summary?.primaryAgent) parts.push(qaUserDisplay(summary.primaryAgent));
    if (summary?.serviceChannel) parts.push(serviceChannelLabel(summary.serviceChannel));
    if (summary?.pool?.name) parts.push(`Pool: ${summary.pool.name}`);
    return parts.length ? parts.join(" · ") : "Score this closed chat and submit the QA report.";
  }, [summary]);

  const handleSubmit = async () => {
    if (readOnly) {
      onClose();
      return;
    }
    await onSave(buildQaSessionReviewBody("completed", formFields));
    onClose();
  };

  const handleSaveProgress = async () => {
    if (isCompleted) return;
    await onSave(buildQaSessionReviewBody("in_progress", formFields));
  };

  if (!bundle) return null;

  return (
    <FormModal
      open={open}
      title={isCompleted ? "QA report (submitted)" : "QA session review"}
      description={description}
      onClose={() => !saving && onClose()}
      onSave={() => void handleSubmit()}
      primaryButtonLabel={isCompleted ? "Close" : saving ? "Submitting…" : "Submit QA report"}
      primaryButtonDisabled={saving || (!isCompleted && readOnly)}
      cancelButtonLabel="Cancel"
      showCancelButton={!isCompleted}
      maxWidth={640}
      fitContent
    >
      {review?.slaDueAt ? (
        <Typography variant="caption" sx={{ color: d.textMuted, display: "block" }}>
          SLA due {new Date(review.slaDueAt).toLocaleString()}
          {review.reviewSlaHours ? ` (${review.reviewSlaHours}h window)` : ""}
        </Typography>
      ) : null}

      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
          Review status
        </Typography>
        <Chip
          size="small"
          label={workflowStatus.replace("_", " ")}
          sx={{
            height: 24,
            fontSize: 12,
            bgcolor: alpha(workflowChipColor, 0.12),
            color: workflowChipColor,
            textTransform: "capitalize",
          }}
        />
        {!isCompleted ? (
          <Typography variant="caption" sx={{ color: d.textMuted, display: "block", mt: 0.75 }}>
            Stays in progress until you submit the QA report. Use Save progress to keep your draft.
          </Typography>
        ) : null}
      </Box>

      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
          Session stars (1–5)
        </Typography>
        <Rating
          value={starRating}
          onChange={(_, v) => setStarRating(v)}
          disabled={readOnly || saving}
        />
      </Box>

      <InputField
        label="QA reason / what went wrong"
        value={failureReason}
        onChange={(e) => setFailureReason(e.target.value)}
        disabled={readOnly || saving}
        placeholder="e.g. Wrong policy, rude tone, missed SLA…"
      />

      <Box>
        <Typography variant="caption" sx={{ color: d.textMuted, display: "block", mb: 0.5 }}>
          Overall score (1–100): {overallScore}
        </Typography>
        <Slider
          value={overallScore}
          min={1}
          max={100}
          disabled={readOnly || saving}
          onChange={(_, v) => setOverallScore(v as number)}
        />
      </Box>

      <InputField
        label="Summary"
        value={summaryText}
        onChange={(e) => setSummaryText(e.target.value)}
        disabled={readOnly || saving}
        multiline
        minRows={2}
      />

      <InputField
        label="Coaching notes"
        value={coachingNotes}
        onChange={(e) => setCoachingNotes(e.target.value)}
        disabled={readOnly || saving}
        multiline
        minRows={2}
      />

      <Box
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          border: `1px solid ${alpha(d.cardBorder, 0.5)}`,
          bgcolor: alpha(d.sidebarBg, 0.35),
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.75 }}>
          Checklist
        </Typography>
        {QA_SESSION_CHECKLIST_KEYS.map((item) => (
          <FormControlLabel
            key={item.key}
            sx={{ display: "flex", ml: 0, mb: 0.25 }}
            control={
              <Checkbox
                size="small"
                checked={Boolean(checklist[item.key])}
                disabled={readOnly || saving}
                onChange={(_, v) => setChecklist((p) => ({ ...p, [item.key]: v }))}
              />
            }
            label={<Typography variant="caption">{item.label}</Typography>}
          />
        ))}
        <FormControlLabel
          sx={{ display: "flex", ml: 0, mt: 0.75 }}
          control={
            <Checkbox
              size="small"
              checked={meaningfulChat}
              disabled={readOnly || saving}
              onChange={(_, v) => setMeaningfulChat(v)}
            />
          }
          label={
            <Typography variant="caption">Count as meaningful chat (website analytics)</Typography>
          }
        />
      </Box>

      {isCompleted && review?.completedAt ? (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            p: 1.25,
            borderRadius: 1.5,
            bgcolor: alpha(d.accentBlue, 0.1),
            color: d.accentBlue,
            textAlign: "center",
          }}
        >
          Submitted {new Date(review.completedAt).toLocaleString()}
        </Typography>
      ) : null}

      {!readOnly ? (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -1 }}>
          <Button
            type="button"
            variant="outlined"
            disabled={saving}
            sx={{ mr: "auto" }}
            onClick={() => void handleSaveProgress()}
          >
            {saving ? "Saving…" : "Save progress"}
          </Button>
        </Box>
      ) : null}
    </FormModal>
  );
}
