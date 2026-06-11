"use client";

import { useState } from "react";
import AssignmentIndOutlined from "@mui/icons-material/AssignmentIndOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { QaReviewBundle, UpsertQaSessionReviewBody } from "@/services/chat/qa.types";
import { ScrollRegion } from "@/features/chat-operations/styles/chat-operations.styled";
import { qaUserLabel } from "../utils/qa-labels";
import { qaUserDisplay, serviceChannelLabel } from "../utils/qa-user-display";
import { QaSessionReviewModal } from "./QaSessionReviewModal";

const WORKFLOW_STEPS = [
  "Pick a closed chat from the queue",
  "Read transcript and annotate messages",
  "Open review form and submit the QA report",
] as const;

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
  const summary = bundle?.sessionSummary ?? null;
  const [assignToId, setAssignToId] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const channel =
    summary?.serviceChannel ??
    review?.serviceChannel ??
    (typeof bundle?.transcript?.serviceChannel === "string"
      ? bundle.transcript.serviceChannel
      : null);

  const agentName = summary?.primaryAgent
    ? qaUserDisplay(summary.primaryAgent)
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
  const isCompleted = review?.status === "completed";
  const status = review?.status ?? "pending";

  const statusChipColor =
    status === "completed"
      ? theme.app.dashboard.accentBlue
      : status === "in_progress"
        ? theme.app.dashboard.accentViolet
        : theme.app.dashboard.accentOrange;

  const openReview = () => setReviewModalOpen(true);

  const handleStartReview = async () => {
    if (review?.status === "pending" && canEdit) {
      await onSave({ status: "in_progress", overallScore: review.overallScore ?? 80 });
    }
    openReview();
  };

  const accent = theme.palette.primary.main;

  return (
    <>
      <ScrollRegion
        sx={{
          flex: "0 1 auto",
          maxHeight: { lg: "50%" },
          minHeight: 0,
          px: 2,
          pt: 2,
          pb: 2.5,
          overflowY: "auto",
        }}
      >
        <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1 }}>
          Session review
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.25 }}>
          {channel ? (
            <Chip
              label={serviceChannelLabel(channel)}
              size="small"
              sx={{ height: 22, fontSize: 11 }}
            />
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
          {review?.overallScore != null ? (
            <Chip label={`Score: ${review.overallScore}`} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
          ) : null}
        </Box>

        {review ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.25 }}>
            Assigned to: <strong>{qaUserLabel(review.assignedQa)}</strong>
            {review.assignSource ? ` · ${review.assignSource.replace(/_/g, " ")}` : ""}
            {isAssignedToMe ? " · You" : ""}
          </Typography>
        ) : (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.25 }}>
            No reviewer assigned yet. Take the review or assign from the roster below.
          </Typography>
        )}

        {slaDue ? (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 1.25,
              color: slaOverdue ? theme.palette.error.main : theme.app.dashboard.textMuted,
            }}
          >
            SLA due {slaDue.toLocaleString()}
            {review?.reviewSlaHours ? ` (${review.reviewSlaHours}h window)` : ""}
          </Typography>
        ) : null}

        {canAssign ? (
          <Box
            sx={{
              mb: 1.5,
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${alpha(accent, 0.22)}`,
              bgcolor: alpha(accent, 0.08),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
              <AssignmentIndOutlined sx={{ fontSize: 20, color: accent }} />
              <Typography fontWeight={700} sx={{ fontSize: 13 }}>
                Assign reviewer
              </Typography>
            </Box>

            {!review ? (
              <Button
                type="button"
                variant="primary"
                fullWidth
                startIcon={<PersonAddOutlined />}
                sx={{ ...gradientPrimaryButtonSx, mb: 1 }}
                disabled={saving || (!meOnRoster && rosterAssignOptions.length > 0)}
                onClick={() => void onClaim()}
              >
                {meOnRoster ? "Take this review" : "Assign to me & start"}
              </Button>
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
                  variant="outlined"
                  fullWidth
                  startIcon={<PersonAddOutlined />}
                  disabled={saving || !assignToId}
                  onClick={() => void onAssignTo(assignToId)}
                >
                  {review ? "Reassign reviewer" : "Assign reviewer"}
                </Button>
              </Box>
            ) : null}
          </Box>
        ) : null}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {canEdit && review && status === "pending" ? (
            <Button
              type="button"
              variant="primary"
              fullWidth
              startIcon={<PlayArrowOutlined />}
              sx={gradientPrimaryButtonSx}
              disabled={saving}
              onClick={() => void handleStartReview()}
            >
              Start review
            </Button>
          ) : null}

          {review ? (
            <Button
              type="button"
              variant={isCompleted ? "outlined" : "primary"}
              fullWidth
              startIcon={isCompleted ? <RateReviewOutlined /> : <EditNoteOutlined />}
              sx={isCompleted ? undefined : gradientPrimaryButtonSx}
              disabled={saving}
              onClick={openReview}
            >
              {isCompleted ? "View submitted report" : "Open QA review form"}
            </Button>
          ) : canEdit ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
              Assign or take this review first, then open the QA form.
            </Typography>
          ) : null}
        </Box>

        {isCompleted && review?.completedAt ? (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1.5,
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.app.dashboard.accentBlue, 0.1),
              color: theme.app.dashboard.accentBlue,
              textAlign: "center",
            }}
          >
            QA report submitted · {new Date(review.completedAt).toLocaleString()}
          </Typography>
        ) : null}
      </ScrollRegion>

      <QaSessionReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        bundle={bundle}
        canEdit={canEdit}
        saving={saving}
        onSave={onSave}
      />
    </>
  );
}
