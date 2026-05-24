"use client";

import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import {
  compileFaqRowsToSourceRef,
  countValidFaqRows,
  createEmptyFaqRow,
  type FaqBuilderRow,
} from "./faq-builder.utils";

export function AiTrainingFaqBuilder({
  rows,
  onRowsChange,
  onCompiledChange,
  variant,
}: {
  rows: FaqBuilderRow[];
  onRowsChange: (rows: FaqBuilderRow[]) => void;
  onCompiledChange: (sourceRef: string) => void;
  variant: "chatbot" | "assistant";
}) {
  const theme = useTheme() as AppTheme;
  const validCount = countValidFaqRows(rows);

  const updateRow = (id: string, patch: Partial<Pick<FaqBuilderRow, "question" | "answer">>) => {
    const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
    onRowsChange(next);
    onCompiledChange(compileFaqRowsToSourceRef(next));
  };

  const addRow = () => {
    const next = [...rows, createEmptyFaqRow()];
    onRowsChange(next);
  };

  const removeRow = (id: string) => {
    const next = rows.length <= 1 ? [createEmptyFaqRow()] : rows.filter((r) => r.id !== id);
    onRowsChange(next);
    onCompiledChange(compileFaqRowsToSourceRef(next));
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight={600} color="white" sx={{ mb: 0.5 }}>
        {variant === "chatbot" ? "Visitor FAQ entries" : "FAQ entries"}
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
        Add one question and answer per row. The bot will match visitor questions to these answers.
      </Typography>

      <Stack spacing={1.5}>
        {rows.map((row, index) => (
          <Box
            key={row.id}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.textMuted }}>
                FAQ #{index + 1}
              </Typography>
              <IconButton
                size="small"
                aria-label="Remove FAQ"
                onClick={() => removeRow(row.id)}
                sx={{ color: theme.app.dashboard.textMuted }}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Box>
            <Stack spacing={1}>
              <InputField
                label="Question"
                value={row.question}
                onChange={(e) => updateRow(row.id, { question: e.target.value })}
                placeholder="What is your return policy?"
              />
              <InputField
                label="Answer"
                value={row.answer}
                onChange={(e) => updateRow(row.id, { answer: e.target.value })}
                placeholder="Returns accepted within 14 days with receipt."
                multiline
                minRows={2}
              />
            </Stack>
          </Box>
        ))}
      </Stack>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5, flexWrap: "wrap", gap: 1 }}>
        <Button type="button" variant="secondary" size="small" onClick={addRow} startIcon={<Add />}>
          Add another FAQ
        </Button>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          {validCount} ready to index{validCount === 1 ? "" : ""}
        </Typography>
      </Box>
    </Box>
  );
}
