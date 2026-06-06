"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useAiTrainingTestRespondMutation } from "@/lib/hooks/query/ai-training/hooks";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";

type TestTurn = {
  id: string;
  question: string;
  answer: string;
  replySource?: string;
  matchCount?: number;
};

export function AiTrainingAssistantTestChat({
  variant,
  websiteId,
  websiteUrl,
}: {
  variant: AiTrainingKbVariant;
  websiteId: string;
  websiteUrl?: string;
}) {
  const theme = useTheme() as AppTheme;
  const testMutation = useAiTrainingTestRespondMutation();
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<TestTurn[]>([]);

  const scopeLabel = variant === "chatbot" ? "Chatbot" : "Assistant";

  const send = async () => {
    const message = input.trim();
    if (!message || testMutation.isPending) return;
    setInput("");
    try {
      const result = await testMutation.mutateAsync({
        websiteId,
        variant,
        message,
        ...(websiteUrl ? { currentPageUrl: websiteUrl } : {}),
      });
      let answer = "";
      let replySource: string | undefined;
      let matchCount: number | undefined;
      if (result.variant === "chatbot") {
        answer = result.response ?? "";
        replySource = result.replySource;
        matchCount = result.knowledgeMatches?.length;
      } else {
        answer =
          typeof result.output === "string"
            ? result.output
            : JSON.stringify(result.output, null, 2);
        replySource = result.action;
      }
      setTurns((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          question: message,
          answer,
          replySource,
          matchCount,
        },
      ]);
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Test request failed.",
      });
    }
  };

  const hint = useMemo(
    () =>
      variant === "chatbot"
        ? "Dry-run uses chatbot training only — no live conversation or analytics."
        : "Uses assistant training (PDFs, FAQs, SOPs) — same as agent copilot.",
    [variant],
  );

  return (
    <Stack spacing={1.5}>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
        {hint}
      </Typography>

      <Box
        sx={{
          maxHeight: 280,
          overflow: "auto",
          borderRadius: 1,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          p: 1.25,
          bgcolor: "rgba(15, 23, 42, 0.35)",
        }}
      >
        {turns.length === 0 ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Ask a question to preview {scopeLabel} replies from indexed training.
          </Typography>
        ) : (
          turns.map((turn) => (
            <Box key={turn.id} sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: theme.palette.primary.light }}>
                You
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.75 }}>
                {turn.question}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.success.light }}>
                {scopeLabel}
                {turn.replySource ? ` · ${turn.replySource}` : ""}
                {turn.matchCount != null ? ` · ${turn.matchCount} sources` : ""}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {turn.answer}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      <InputField
        name="testMessage"
        label="Test question"
        multiline
        minRows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        inputProps={{ maxLength: 2000 }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            void send();
          }
        }}
      />
      <Button
        type="button"
        variant="primary"
        disabled={!input.trim() || testMutation.isPending}
        onClick={() => void send()}
      >
        {testMutation.isPending ? "Testing…" : "Send test"}
      </Button>
    </Stack>
  );
}
