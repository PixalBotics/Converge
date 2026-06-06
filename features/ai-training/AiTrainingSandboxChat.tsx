"use client";

import { useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import type { AiPipelineStep } from "@/api/ai-training/ai-training.api";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useAiTrainingTestRespondMutation } from "@/lib/hooks/query/ai-training/hooks";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";
import { AiTrainingPipelineTrace } from "./AiTrainingPipelineTrace";

type SandboxTurn = {
  id: string;
  role: "visitor" | "ai";
  text: string;
  meta?: string;
  pipeline?: AiPipelineStep[];
};

export function AiTrainingSandboxChat({
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
  const [turns, setTurns] = useState<SandboxTurn[]>([]);
  const [activePipeline, setActivePipeline] = useState<AiPipelineStep[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const scopeLabel = variant === "chatbot" ? "Chatbot" : "Assistant";

  const hint = useMemo(
    () =>
      variant === "chatbot"
        ? "Sandbox — no live conversation or analytics. Same KB + LLM pipeline as the visitor widget."
        : "Sandbox — assistant training only (PDFs, FAQs, SOPs). Same as agent copilot.",
    [variant],
  );

  const send = async () => {
    const message = input.trim();
    if (!message || testMutation.isPending) return;
    setInput("");
    const visitorId = `v-${Date.now()}`;
    setTurns((prev) => [...prev, { id: visitorId, role: "visitor", text: message }]);

    try {
      const result = await testMutation.mutateAsync({
        websiteId,
        variant,
        message,
        ...(websiteUrl ? { currentPageUrl: websiteUrl } : {}),
      });

      let answer = "";
      let meta = "";
      let pipeline: AiPipelineStep[] = result.pipeline ?? [];

      if (result.variant === "chatbot") {
        answer = result.response ?? "";
        meta = [
          result.replySource,
          result.intent,
          result.knowledgeMatches?.length != null
            ? `${result.knowledgeMatches.length} sources`
            : null,
        ]
          .filter(Boolean)
          .join(" · ");
      } else {
        answer =
          typeof result.output === "string"
            ? result.output
            : JSON.stringify(result.output, null, 2);
        meta = result.action;
        if (pipeline.length === 0) {
          pipeline = [
            {
              id: "assistant",
              label: "Assistant copilot",
              detail: `Action: ${result.action}`,
              status: "done",
            },
            {
              id: "reply",
              label: "Reply",
              detail: "Generated from assistant training scope",
              status: "done",
            },
          ];
        }
      }

      setActivePipeline(pipeline);
      setTurns((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "ai",
          text: answer,
          meta,
          pipeline,
        },
      ]);

      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Test request failed.",
      });
    }
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
        <Chip
          size="small"
          label="Sandbox"
          sx={{
            bgcolor: "rgba(59, 130, 246, 0.15)",
            color: theme.palette.info.light,
            fontWeight: 600,
          }}
        />
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          {hint}
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 1.5,
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            borderRadius: 1.5,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            overflow: "hidden",
            bgcolor: "#eef1f7",
            minHeight: 320,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              {scopeLabel} preview
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Visitor-facing chat (test only)
            </Typography>
          </Box>
          <Box
            ref={listRef}
            sx={{
              flex: 1,
              overflow: "auto",
              p: 1.25,
              maxHeight: 260,
              bgcolor: "rgba(255,255,255,0.92)",
            }}
          >
            {turns.length === 0 ? (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Ask a question to preview replies from indexed training.
              </Typography>
            ) : (
              turns.map((turn) => (
                <Box
                  key={turn.id}
                  sx={{
                    mb: 1,
                    display: "flex",
                    justifyContent: turn.role === "visitor" ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "88%",
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 2,
                      bgcolor:
                        turn.role === "visitor"
                          ? theme.palette.primary.main
                          : "rgba(15, 23, 42, 0.08)",
                      color: turn.role === "visitor" ? "#fff" : theme.palette.text.primary,
                    }}
                  >
                    {turn.meta ? (
                      <Typography variant="caption" sx={{ opacity: 0.75, display: "block", mb: 0.25 }}>
                        {turn.meta}
                      </Typography>
                    ) : null}
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {turn.text}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Box>
          <Box sx={{ p: 1, borderTop: `1px solid ${theme.app.dashboard.cardBorder}`, bgcolor: "#fff" }}>
            <InputField
              name="sandboxMessage"
              label="Test message"
              multiline
              minRows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              inputProps={{ maxLength: 2000 }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <Button
              type="button"
              variant="primary"
              size="small"
              sx={{ mt: 1 }}
              disabled={!input.trim() || testMutation.isPending}
              onClick={() => void send()}
            >
              {testMutation.isPending ? "Running…" : "Send"}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            borderRadius: 1.5,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            p: 1.25,
            bgcolor: "rgba(15, 23, 42, 0.35)",
            minHeight: 320,
          }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1, color: theme.app.dashboard.white95 }}>
            Pipeline
          </Typography>
          <AiTrainingPipelineTrace steps={activePipeline} />
        </Box>
      </Box>
    </Stack>
  );
}
