"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  QA_REVIEW_STATUSES,
  type QaReviewBundle,
  type QaReviewStatus,
  type UpsertQaSessionReviewBody,
} from "@/services/chat/qa.types";
import { ScrollRegion } from "@/features/chat-operations/styles/chat-operations.styled";
import { qaUserLabel } from "../utils/qa-labels";

const CHECKLIST_KEYS = [
  { key: "professionalTone", label: "Professional tone" },
  { key: "accurateInfo", label: "Accurate information" },
  { key: "policyCompliance", label: "Policy compliance" },
  { key: "timelyResponse", label: "Timely responses" },
] as const;

function readChecklist(json?: Record<string, unknown> | null): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const item of CHECKLIST_KEYS) {
    out[item.key] = json?.[item.key] === true;
  }
  return out;
}

interface QaSessionReviewPanelProps {
  bundle: QaReviewBundle | null;
  canEdit: boolean;
  canAssign: boolean;
  onSave: (body: UpsertQaSessionReviewBody) => Promise<void>;
  onClaim: () => Promise<void>;
  saving?: boolean;
}

export function QaSessionReviewPanel({
  bundle,
  canEdit,
  canAssign,
  onSave,
  onClaim,
  saving = false,
}: QaSessionReviewPanelProps) {
  const theme = useTheme() as AppTheme;
  const review = bundle?.review ?? null;

  const [status, setStatus] = useState<QaReviewStatus>("pending");
  const [overallScore, setOverallScore] = useState(80);
  const [summary, setSummary] = useState("");
  const [coachingNotes, setCoachingNotes] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!review) {
      setStatus("in_progress");
      setOverallScore(80);
      setSummary("");
      setCoachingNotes("");
      setChecklist(readChecklist(null));
      return;
    }
    setStatus(review.status);
    setOverallScore(review.overallScore ?? 80);
    setSummary(review.summary ?? "");
    setCoachingNotes(review.coachingNotes ?? "");
    setChecklist(readChecklist(review.checklistJson ?? null));
  }, [review?.id, review?.status, review?.overallScore, review?.summary, review?.coachingNotes, review?.checklistJson]);

  if (!bundle) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: theme.app.dashboard.textMuted, fontSize: 13 }}>
          Session review and timeline appear when you open a chat.
        </Typography>
      </Box>
    );
  }

  const slaDue = review?.slaDueAt ? new Date(review.slaDueAt) : null;
  const slaOverdue = slaDue && slaDue.getTime() < Date.now() && review?.status !== "completed";

  const handleSave = () => {
    const checklistJson: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(checklist)) {
      if (v) checklistJson[k] = true;
    }
    void onSave({
      status,
      overallScore,
      summary: summary.trim() || undefined,
      coachingNotes: coachingNotes.trim() || undefined,
      checklistJson,
    });
  };

  return (
    <ScrollRegion sx={{ flex: 1, px: 2, py: 2 }}>
      <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1 }}>
        Session review
      </Typography>

      {review ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
          Assigned: {qaUserLabel(review.assignedQa)}
          {review.assignSource ? ` · ${review.assignSource}` : ""}
        </Typography>
      ) : null}

      {slaDue ? (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 1,
            color: slaOverdue ? theme.palette.error.main : theme.app.dashboard.textMuted,
          }}
        >
          SLA due {slaDue.toLocaleString()}
          {review?.reviewSlaHours ? ` (${review.reviewSlaHours}h window)` : ""}
        </Typography>
      ) : null}

      {!review && canAssign ? (
        <Button
          type="button"
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 2 }}
          disabled={saving}
          onClick={() => void onClaim()}
        >
          Claim review
        </Button>
      ) : null}

      <FormControl fullWidth size="small" sx={{ mb: 2 }} disabled={!canEdit || saving}>
        <InputLabel>Status</InputLabel>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as QaReviewStatus)}>
          {QA_REVIEW_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s.replace("_", " ")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
        Overall score: {overallScore}
      </Typography>
      <Slider
        value={overallScore}
        min={1}
        max={100}
        disabled={!canEdit || saving}
        onChange={(_, v) => setOverallScore(v as number)}
        sx={{ mb: 2 }}
      />

      <InputField
        label="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        disabled={!canEdit || saving}
        sx={{ mb: 1.5 }}
      />
      <InputField
        label="Coaching notes"
        value={coachingNotes}
        onChange={(e) => setCoachingNotes(e.target.value)}
        disabled={!canEdit || saving}
        sx={{ mb: 1.5 }}
      />

      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
        Checklist
      </Typography>
      {CHECKLIST_KEYS.map((item) => (
        <FormControlLabel
          key={item.key}
          sx={{ display: "flex", ml: 0, mb: 0.25 }}
          control={
            <Checkbox
              size="small"
              checked={Boolean(checklist[item.key])}
              disabled={!canEdit || saving}
              onChange={(_, v) => setChecklist((p) => ({ ...p, [item.key]: v }))}
            />
          }
          label={<Typography variant="caption">{item.label}</Typography>}
        />
      ))}

      {canEdit ? (
        <Button
          type="button"
          variant="primary"
          fullWidth
          sx={{ ...gradientPrimaryButtonSx, mt: 2 }}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save session review"}
        </Button>
      ) : null}
    </ScrollRegion>
  );
}
