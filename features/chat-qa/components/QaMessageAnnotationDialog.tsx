"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Rating from "@mui/material/Rating";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
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
    <Dialog
      open={open}
      onClose={() => !saving && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.app.dashboard.cardBg,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Message annotation</DialogTitle>
      <DialogContent>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 2,
            color: theme.app.dashboard.textMuted,
            maxHeight: 80,
            overflow: "auto",
          }}
        >
          {messagePreview.slice(0, 400)}
          {messagePreview.length > 400 ? "…" : ""}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Rating (1–5)
            </Typography>
            <Rating value={rating} onChange={(_, v) => setRating(v)} max={5} sx={{ mt: 0.5 }} />
          </Box>
          <InputField
            label="Tags (comma-separated)"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            disabled={saving}
          />
          <InputField
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={saving}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button type="button" variant="secondary" disabled={saving} onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          sx={gradientPrimaryButtonSx}
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? "Saving…" : "Save annotation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
