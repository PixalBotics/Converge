"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { FormModal, InputField, Typography } from "@/components/common";
import type { MessageQaAnnotation, UpsertQaMessageAnnotationBody } from "@/services/chat/qa.types";

interface QaMessageAnnotationDialogProps {
  open: boolean;
  messagePreview: string;
  existing: MessageQaAnnotation | null;
  onClose: () => void;
  onSave: (body: UpsertQaMessageAnnotationBody) => Promise<void>;
  saving?: boolean;
}

export function QaMessageAnnotationDialog({
  open,
  messagePreview,
  existing,
  onClose,
  onSave,
  saving = false,
}: QaMessageAnnotationDialogProps) {
  const theme = useTheme() as AppTheme;
  const [rating, setRating] = useState<number | null>(null);
  const [tagsText, setTagsText] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!open) return;
    setRating(existing?.rating ?? null);
    setTagsText((existing?.tags ?? []).join(", "));
    setComment(existing?.comment ?? "");
  }, [open, existing]);

  const handleSave = async () => {
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await onSave({
      ...(rating != null ? { rating } : {}),
      ...(tags.length ? { tags } : {}),
      ...(comment.trim() ? { comment: comment.trim() } : {}),
    });
    onClose();
  };

  return (
    <FormModal
      open={open}
      title="Message annotation"
      description="Rate and comment on this message for the QA review."
      onClose={() => !saving && onClose()}
      onSave={() => void handleSave()}
      primaryButtonLabel={saving ? "Saving…" : "Save annotation"}
      primaryButtonDisabled={saving}
      cancelButtonLabel="Cancel"
      maxWidth={520}
      fitContent
    >
      <Box
        sx={{
          p: 1.25,
          borderRadius: 1.5,
          bgcolor: theme.app.dashboard.sidebarBg,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          maxHeight: 100,
          overflow: "auto",
        }}
      >
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
          {messagePreview.slice(0, 400)}
          {messagePreview.length > 400 ? "…" : ""}
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
          Rating (1–5)
        </Typography>
        <Rating
          value={rating}
          onChange={(_, v) => setRating(v)}
          max={5}
          disabled={saving}
        />
      </Box>

      <InputField
        label="Tags (comma-separated)"
        value={tagsText}
        onChange={(e) => setTagsText(e.target.value)}
        disabled={saving}
        placeholder="e.g. tone, accuracy, policy"
      />

      <InputField
        label="Comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={saving}
        multiline
        minRows={3}
        placeholder="What should the agent improve on this message?"
      />
    </FormModal>
  );
}
