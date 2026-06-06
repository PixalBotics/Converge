"use client";

import { useEffect, useMemo, useState } from "react";
import AssignmentIndOutlined from "@mui/icons-material/AssignmentIndOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Rating from "@mui/material/Rating";
import { alpha, useTheme } from "@mui/material/styles";
import Link from "next/link";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
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

const WORKFLOW_STEPS = [
  "Pick a closed chat from the queue",
  "Read transcript and annotate messages",
  "Score the session and submit the QA report",
] as const;

function readChecklist(json?: Record<string, unknown> | null): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const item of CHECKLIST_KEYS) {
    out[item.key] = json?.[item.key] === true;
  }
  return out;
}

function buildReviewBody(
  status: QaReviewStatus,
  fields: {
    starRating: number | null;
    failureReason: string;
    overallScore: number;
    summary: string;
    coachingNotes: string;
    checklist: Record<string, boolean>;
    meaningfulChat: boolean;
  },
): UpsertQaSessionReviewBody {
  const checklistJson: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields.checklist)) {
    if (v) checklistJson[k] = true;
  }
  return {
    status,
    starRating: fields.starRating ?? undefined,
    failureReason: fields.failureReason.trim() || undefined,
    overallScore: fields.overallScore,
    summary: fields.summary.trim() || undefined,
    coachingNotes: fields.coachingNotes.trim() || undefined,
    checklistJson,
    ...(status === "completed" ? { meaningfulChat: fields.meaningfulChat } : {}),
  };
}

type AssignOption = { id: string; label: string };

interface QaSessionReviewPanelProps {
  bundle: QaReviewBundle | null;
  canEdit: boolean;
  canAssign: boolean;
  currentUserId?: string | null;
  rosterAssignOptions?: AssignOption[];
  onSave: (body: UpsertQaSessionReviewBody) => Promise<void>;
  onClaim: () => Promise<void>;
  onAssignTo?: (qaUserId: string) => Promise<void>;
  saving?: boolean;
}

export function QaSessionReviewPanel({
  bundle,
  canEdit,
  canAssign,
  currentUserId = null,
  rosterAssignOptions = [],
  onSave,
  onClaim,
  onAssignTo,
  saving = false,
}: QaSessionReviewPanelProps) {
  const theme = useTheme() as AppTheme;
  const review = bundle?.review ?? null;

  const [status, setStatus] = useState<QaReviewStatus>("pending");
  const [starRating, setStarRating] = useState<number | null>(3);
  const [failureReason, setFailureReason] = useState("");
  const [assignToId, setAssignToId] = useState("");
  const [overallScore, setOverallScore] = useState(80);
  const [summary, setSummary] = useState("");
  const [coachingNotes, setCoachingNotes] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [meaningfulChat, setMeaningfulChat] = useState(false);

  const formFields = useMemo(
    () => ({
      starRating,
      failureReason,
      overallScore,
      summary,
      coachingNotes,
      checklist,
      meaningfulChat,
    }),
    [starRating, failureReason, overallScore, summary, coachingNotes, checklist, meaningfulChat],
  );

  useEffect(() => {
    if (!review) {
      setStatus("in_progress");
      setStarRating(3);
      setFailureReason("");
      setOverallScore(80);
      setSummary("");
      setCoachingNotes("");
      setChecklist(readChecklist(null));
      setMeaningfulChat(false);
      return;
    }
    setStatus(review.status);
    setStarRating(review.starRating ?? null);
    setFailureReason(review.failureReason ?? "");
    setOverallScore(review.overallScore ?? 80);
    setSummary(review.summary ?? "");
    setCoachingNotes(review.coachingNotes ?? "");
    setChecklist(readChecklist(review.checklistJson ?? null));
  }, [
    review?.id,
    review?.status,
    review?.starRating,
    review?.failureReason,
    review?.overallScore,
    review?.summary,
    review?.coachingNotes,
    review?.checklistJson,
  ]);

  const transcriptMeta = bundle?.transcript as Record<string, unknown> | undefined;
  const channel =
    review?.serviceChannel ??
    (typeof transcriptMeta?.serviceChannel === "string" ? transcriptMeta.serviceChannel : null);
  const agentName =
    typeof transcriptMeta?.agent === "object" && transcriptMeta.agent
      ? [
          String((transcriptMeta.agent as Record<string, unknown>).firstName ?? ""),
          String((transcriptMeta.agent as Record<string, unknown>).lastName ?? ""),
        ]
          .filter(Boolean)
          .join(" ")
      : null;

  const meOnRoster = Boolean(
    currentUserId && rosterAssignOptions.some((o) => o.id === currentUserId),
  );
  const isAssignedToMe = Boolean(
    currentUserId && review?.assignedQa?.id === currentUserId,
  );

  if (!bundle) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: theme.app.dashboard.textMuted, fontSize: 13, mb: 1.5 }}>
          Select a chat from the queue to review the transcript and submit a QA report.
        </Typography>
        <Box component="ol" sx={{ m: 0, pl: 2.25, color: theme.app.dashboard.textMuted, fontSize: 12 }}>
          {WORKFLOW_STEPS.map((step) => (
            <Box component="li" key={step} sx={{ mb: 0.5 }}>
              {step}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  const slaDue = review?.slaDueAt ? new Date(review.slaDueAt) : null;
  const slaOverdue = slaDue && slaDue.getTime() < Date.now() && review?.status !== "completed";
  const isCompleted = review?.status === "completed" || status === "completed";

  const persist = (nextStatus: QaReviewStatus) => {
    void onSave(buildReviewBody(nextStatus, formFields));
  };

  const statusChipColor =
    status === "completed"
      ? theme.app.dashboard.accentBlue
      : status === "in_progress"
        ? theme.app.dashboard.accentViolet
        : theme.app.dashboard.accentOrange;

  return (
    <ScrollRegion sx={{ flex: 1, px: 2, py: 2 }}>
      <Typography fontWeight={700} sx={{ fontSize: 14, mb: 0.75 }}>
        Session review
      </Typography>

      <Box
        sx={{
          mb: 2,
          p: 1.25,
          borderRadius: 1.5,
          bgcolor: alpha(theme.app.dashboard.accentViolet, 0.06),
          border: `1px solid ${alpha(theme.app.dashboard.accentViolet, 0.2)}`,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.75 }}>
          QA workflow
        </Typography>
        <Box component="ol" sx={{ m: 0, pl: 2, fontSize: 11, color: theme.app.dashboard.textMuted }}>
          {WORKFLOW_STEPS.map((step, i) => (
            <Box
              component="li"
              key={step}
              sx={{
                mb: 0.35,
                fontWeight: bundle && i === 2 && isCompleted ? 600 : 400,
                color: bundle && i === 2 && isCompleted ? theme.app.dashboard.accentBlue : undefined,
              }}
            >
              {step}
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
        {channel ? (
          <Chip label={channel} size="small" sx={{ height: 22, fontSize: 11 }} />
        ) : null}
        <Chip
          label={status.replace("_", " ")}
          size="small"
          sx={{
            height: 22,
            fontSize: 11,
            bgcolor: alpha(statusChipColor, 0.12),
            color: statusChipColor,
          }}
        />
        {agentName ? (
          <Chip label={`Agent: ${agentName}`} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
        ) : null}
      </Box>

      {review ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
          Assigned to: <strong>{qaUserLabel(review.assignedQa)}</strong>
          {review.assignSource ? ` · ${review.assignSource.replace(/_/g, " ")}` : ""}
          {isAssignedToMe ? " · You" : ""}
        </Typography>
      ) : (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
          No reviewer assigned yet. A supervisor can assign from the roster, or you can take the review if you are
          on the website QA roster.
        </Typography>
      )}

      {canAssign ? (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 1.5,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: alpha(theme.app.dashboard.accentBlue, 0.04),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
            <AssignmentIndOutlined sx={{ fontSize: 20, color: theme.app.dashboard.accentBlue }} />
            <Typography fontWeight={700} sx={{ fontSize: 13 }}>
              Assign reviewer
            </Typography>
          </Box>

          {!review && canAssign ? (
            <Button
              type="button"
              variant="primary"
              fullWidth
              startIcon={<PersonAddOutlined />}
              sx={{ ...gradientPrimaryButtonSx, mb: 1.25 }}
              disabled={saving || (!meOnRoster && rosterAssignOptions.length > 0)}
              onClick={() => void onClaim()}
            >
              {meOnRoster ? "Take this review" : "Assign to me & start"}
            </Button>
          ) : null}
          {!review && canAssign && !meOnRoster && rosterAssignOptions.length > 0 ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
              You are not on the QA roster for this channel — pick a reviewer below or add yourself under QA roster
              settings.
            </Typography>
          ) : null}

          {rosterAssignOptions.length > 0 && onAssignTo ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <SelectField
                label="QA reviewer (roster)"
                value={assignToId}
                onChange={setAssignToId}
                options={[
                  { value: "", label: "Select reviewer…" },
                  ...rosterAssignOptions.map((o) => ({ value: o.id, label: o.label })),
                ]}
                disabled={saving}
                menuMaxRows={8}
                searchPlaceholder="Search reviewer…"
              />
              <Button
                type="button"
                variant="primary"
                fullWidth
                startIcon={<PersonAddOutlined />}
                sx={gradientPrimaryButtonSx}
                disabled={saving || !assignToId}
                onClick={() => void onAssignTo(assignToId)}
              >
                {review ? "Reassign reviewer" : "Assign reviewer"}
              </Button>
            </Box>
          ) : (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
              No QA reviewers on the roster for this website and channel. Add reviewers under{" "}
              <Link href="/dashboard/chat-involvement" style={{ color: theme.app.dashboard.accentBlue }}>
                Chat involvement → QA roster
              </Link>{" "}
              or{" "}
              <Link href="/dashboard/qa/roster" style={{ color: theme.app.dashboard.accentBlue }}>
                Chat settings → QA roster
              </Link>
              .
            </Typography>
          )}
        </Box>
      ) : null}

      {slaDue ? (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 1.5,
            color: slaOverdue ? theme.palette.error.main : theme.app.dashboard.textMuted,
          }}
        >
          SLA due {slaDue.toLocaleString()}
          {review?.reviewSlaHours ? ` (${review.reviewSlaHours}h window)` : ""}
        </Typography>
      ) : null}

      {canEdit && review && review.status === "pending" ? (
        <Button
          type="button"
          variant="primary"
          fullWidth
          startIcon={<PlayArrowOutlined />}
          sx={{ ...gradientPrimaryButtonSx, mb: 2 }}
          disabled={saving}
          onClick={() => {
            setStatus("in_progress");
            persist("in_progress");
          }}
        >
          Start review
        </Button>
      ) : null}

      <FormControl fullWidth size="small" sx={{ mb: 2 }} disabled={!canEdit || saving || isCompleted}>
        <InputLabel>Status</InputLabel>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as QaReviewStatus)}>
          {QA_REVIEW_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s.replace("_", " ")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
        Session stars (1–5)
      </Typography>
      <Rating
        value={starRating}
        onChange={(_, v) => setStarRating(v)}
        disabled={!canEdit || saving || isCompleted}
        sx={{ mb: 1.5 }}
      />

      <InputField
        label="QA reason / what went wrong"
        value={failureReason}
        onChange={(e) => setFailureReason(e.target.value)}
        disabled={!canEdit || saving || isCompleted}
        placeholder="e.g. Wrong policy, rude tone, missed SLA…"
        sx={{ mb: 1.5 }}
      />

      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
        Overall score (1–100): {overallScore}
      </Typography>
      <Slider
        value={overallScore}
        min={1}
        max={100}
        disabled={!canEdit || saving || isCompleted}
        onChange={(_, v) => setOverallScore(v as number)}
        sx={{ mb: 2 }}
      />

      <InputField
        label="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        disabled={!canEdit || saving || isCompleted}
        sx={{ mb: 1.5 }}
      />
      <InputField
        label="Coaching notes"
        value={coachingNotes}
        onChange={(e) => setCoachingNotes(e.target.value)}
        disabled={!canEdit || saving || isCompleted}
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
              disabled={!canEdit || saving || isCompleted}
              onChange={(_, v) => setChecklist((p) => ({ ...p, [item.key]: v }))}
            />
          }
          label={<Typography variant="caption">{item.label}</Typography>}
        />
      ))}

      <FormControlLabel
        sx={{ display: "flex", ml: 0, mt: 1, mb: 0.5 }}
        control={
          <Checkbox
            size="small"
            checked={meaningfulChat}
            disabled={!canEdit || saving || isCompleted}
            onChange={(_, v) => setMeaningfulChat(v)}
          />
        }
        label={
          <Typography variant="caption">
            Count as meaningful chat (website analytics)
          </Typography>
        }
      />

      {canEdit && !isCompleted ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
          <Button
            type="button"
            variant="primary"
            fullWidth
            startIcon={<CheckCircleOutline />}
            sx={gradientPrimaryButtonSx}
            disabled={saving}
            onClick={() => {
              setStatus("completed");
              void onSave(buildReviewBody("completed", formFields));
            }}
          >
            {saving ? "Submitting…" : "Submit QA report"}
          </Button>
          <Button
            type="button"
            variant="outlined"
            fullWidth
            disabled={saving}
            onClick={() => persist(status === "pending" ? "in_progress" : status)}
          >
            {saving ? "Saving…" : "Save progress"}
          </Button>
        </Box>
      ) : null}

      {isCompleted ? (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 2,
            p: 1,
            borderRadius: 1,
            bgcolor: alpha(theme.app.dashboard.accentBlue, 0.1),
            color: theme.app.dashboard.accentBlue,
            textAlign: "center",
          }}
        >
          QA report submitted
          {review?.completedAt ? ` · ${new Date(review.completedAt).toLocaleString()}` : ""}
        </Typography>
      ) : null}
    </ScrollRegion>
  );
}
