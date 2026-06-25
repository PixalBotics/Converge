"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  FormModal,
  InputField,
  SelectField,
  Typography,
} from "@/components/common";
import { SPAM_CATEGORIES, type SpamCategoryValue } from "../utils/chat-close-outcome";

export type MarkSpamModalProps = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (input: { spamCategory: SpamCategoryValue; notes: string }) => void;
};

export function MarkSpamModal({
  open,
  busy = false,
  onClose,
  onConfirm,
}: MarkSpamModalProps) {
  const theme = useTheme() as AppTheme;
  const [category, setCategory] = useState<SpamCategoryValue>("promotional");
  const [notes, setNotes] = useState("");

  const notesRequired = category === "other";

  const handleConfirm = () => {
    if (notesRequired && !notes.trim()) return;
    onConfirm({ spamCategory: category, notes: notes.trim() });
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSave={handleConfirm}
      title="Mark as spam"
      description="This ends the chat immediately. No distribution form will be required. A spam record is saved with your reason."
      primaryButtonLabel={busy ? "Saving…" : "Confirm spam"}
      primaryButtonDisabled={busy || (notesRequired && !notes.trim())}
      cancelButtonLabel="Cancel"
      maxWidth={520}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <SelectField
          label="Why is this spam?"
          value={category}
          onChange={(value) => setCategory(value as SpamCategoryValue)}
          options={SPAM_CATEGORIES.map((c) => ({
            value: c.value,
            label: c.label,
          }))}
        />
        <InputField
          label={notesRequired ? "Additional notes" : "Additional notes (optional)"}
          name="spamNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          minRows={3}
          required={notesRequired}
          placeholder="Brief context for reporting and audit…"
        />
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Spam chats appear only in the Spam queue — not in Pending form.
        </Typography>
      </Box>
    </FormModal>
  );
}
