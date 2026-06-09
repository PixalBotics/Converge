"use client";

import { useEffect, useState } from "react";
import FormatQuoteRounded from "@mui/icons-material/FormatQuoteRounded";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import { alpha, useTheme } from "@mui/material/styles";
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

function sectionLabelSx(theme: AppTheme): object {
  return {
    fontWeight: 600,
    fontSize: 13,
    color: theme.app.text.primary,
    display: "block",
    mb: 0.75,
  };
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
  const accent = theme.palette.primary.main;
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

  const previewText =
    messagePreview.length > 400 ? `${messagePreview.slice(0, 400)}…` : messagePreview;

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
      maxWidth={480}
      fitContent
    >
      <Box>
        <Typography sx={sectionLabelSx(theme)}>Message</Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.25,
            px: 1.5,
            py: 1.25,
            borderRadius: 2,
            bgcolor: alpha(accent, 0.1),
            border: `1px solid ${alpha(accent, 0.22)}`,
            maxHeight: 120,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <FormatQuoteRounded
            sx={{
              fontSize: 18,
              color: alpha(accent, 0.7),
              flexShrink: 0,
              mt: 0.2,
            }}
          />
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.55,
              color: theme.app.text.primary,
              wordBreak: "break-word",
              flex: 1,
            }}
          >
            {previewText || "—"}
          </Typography>
        </Box>
      </Box>

      <Box>
        <Typography sx={sectionLabelSx(theme)}>Rating (1–5)</Typography>
        <Rating
          value={rating}
          onChange={(_, v) => setRating(v)}
          max={5}
          size="large"
          disabled={saving}
          sx={{
            "& .MuiRating-iconEmpty": {
              color: alpha(accent, 0.3),
            },
            "& .MuiRating-iconFilled": {
              color: accent,
            },
            "& .MuiRating-iconHover": {
              color: alpha(accent, 0.8),
            },
          }}
        />
      </Box>

      <InputField
        label="Tags (comma-separated)"
        value={tagsText}
        onChange={(e) => setTagsText(e.target.value)}
        disabled={saving}
        placeholder="e.g. tone, accuracy, policy"
        dense
      />

      <InputField
        label="Comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={saving}
        multiline
        minRows={3}
        placeholder="What should the agent improve on this message?"
        dense
      />
    </FormModal>
  );
}
