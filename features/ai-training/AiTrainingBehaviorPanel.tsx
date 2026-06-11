"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { WebsiteAiBehavior } from "@/api/ai-training/ai-training.api";
import { Button, InputField, Typography } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  useAiTrainingBehaviorQuery,
  useUpdateAiTrainingBehaviorMutation,
} from "@/lib/hooks/query/ai-training/hooks";
import {
  aiTrainingSettingsFieldSx,
  aiTrainingSettingsSliderSx,
} from "./ai-training-studio.styles";
import { studioColors } from "./ai-training-studio.tokens";

type MessageField = {
  key: keyof WebsiteAiBehavior;
  label: string;
  when: string;
  example: string;
};

const MESSAGE_FIELDS: MessageField[] = [
  {
    key: "greetingMessage",
    label: "Welcome message",
    when: "Visitor sends only hi, hello, or hey.",
    example: "Hello! Welcome to our site. How can I help you today?",
  },
  {
    key: "noMatchMessage",
    label: "No training match",
    when: "Nothing relevant found in your indexed training content.",
    example: "I could not find that in our site content. Try rephrasing or contact our team.",
  },
  {
    key: "lowConfidenceMessage",
    label: "Low confidence answer",
    when: "Training match is too weak (below confidence threshold).",
    example: "I am not fully sure about that. Please ask another way or speak with our team.",
  },
  {
    key: "escalationMessage",
    label: "Talk to agent message",
    when: 'Visitor asks for a human (e.g. "talk to agent").',
    example: "Connecting you with our team. A live agent will assist you shortly.",
  },
  {
    key: "llmErrorMessage",
    label: "AI unavailable",
    when: "The AI provider fails or times out.",
    example: "Our assistant is temporarily unavailable. Please try again or contact support.",
  },
  {
    key: "partialMatchMessage",
    label: "Partial match (optional)",
    when: "Optional fixed text instead of auto excerpt from training.",
    example: "Leave blank to let AI generate the answer from training.",
  },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  const c = studioColors(theme);
  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 2,
        bgcolor: c.surfaceMuted,
        border: `1px solid ${c.border}`,
      }}
    >
      <Typography variant="body2" fontWeight={700} sx={{ color: c.text, mb: 0.35 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: c.textSecondary, display: "block", mb: 1.5, lineHeight: 1.5 }}>
        {description}
      </Typography>
      {children}
    </Box>
  );
}

export function AiTrainingBehaviorPanel({
  websiteId,
  variant = "default",
}: {
  websiteId: string;
  variant?: "default" | "studio";
}) {
  const theme = useTheme() as AppTheme;
  const isStudio = variant === "studio";
  const c = studioColors(theme);
  const behaviorQuery = useAiTrainingBehaviorQuery(websiteId);
  const updateMutation = useUpdateAiTrainingBehaviorMutation();
  const [draft, setDraft] = useState<WebsiteAiBehavior | null>(null);

  useEffect(() => {
    if (behaviorQuery.data) setDraft(behaviorQuery.data);
  }, [behaviorQuery.data]);

  const fieldSx = isStudio ? aiTrainingSettingsFieldSx : undefined;

  if (behaviorQuery.isLoading || !draft) {
    return (
      <Typography variant="body2" sx={{ color: c.textSecondary }}>
        Loading bot settings…
      </Typography>
    );
  }

  const save = async () => {
    try {
      await updateMutation.mutateAsync({ websiteId, body: draft });
      publishAppToast({ variant: "success", message: "Bot settings saved." });
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Could not save settings.",
      });
    }
  };

  const threshold = draft.confidenceThreshold ?? 0.26;
  const thresholdLabel =
    threshold >= 0.4 ? "Strict" : threshold >= 0.28 ? "Balanced" : "Relaxed";

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(c.accent, 0.08),
          border: `1px solid ${alpha(c.accent, 0.25)}`,
        }}
      >
        <Typography variant="body2" fontWeight={700} sx={{ color: c.text, mb: 0.5 }}>
          What these settings control
        </Typography>
        <Typography variant="caption" sx={{ color: c.textSecondary, lineHeight: 1.55, display: "block" }}>
          The flow diagram shows the path. These settings control how strict the bot is and exactly what text it
          sends in each situation. Changes apply to live widget chat after you save.
        </Typography>
      </Box>

      <Section
        title="Answer quality"
        description="How sure the bot must be before it answers from your training (instead of a fallback message)."
      >
        <Typography variant="caption" sx={{ color: c.textSecondary, display: "block", mb: 1 }}>
          Current: {thresholdLabel} ({threshold.toFixed(2)}) — higher means fewer guesses, more fallback replies.
        </Typography>
        <Slider
          size="small"
          min={0.1}
          max={0.6}
          step={0.02}
          value={threshold}
          onChange={(_, v) =>
            setDraft((prev) =>
              prev ? { ...prev, confidenceThreshold: typeof v === "number" ? v : v[0] } : prev,
            )
          }
          valueLabelDisplay="auto"
          sx={isStudio ? aiTrainingSettingsSliderSx : undefined}
        />
        <FormControlLabel
          sx={{ alignItems: "flex-start", m: 0, mt: 1.25 }}
          control={
            <Checkbox
              checked={draft.strictKbOnly}
              onChange={(e) =>
                setDraft((prev) => (prev ? { ...prev, strictKbOnly: e.target.checked } : prev))
              }
              size="small"
              sx={{ color: c.textSecondary, "&.Mui-checked": { color: c.accent }, mt: 0.1 }}
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ color: c.text }}>
                Never use AI generation when confidence is low
              </Typography>
              <Typography variant="caption" sx={{ color: c.textSecondary, lineHeight: 1.45 }}>
                When enabled, the bot always shows your fallback text instead of asking the AI model.
              </Typography>
            </Box>
          }
        />
      </Section>

      <Divider sx={{ borderColor: alpha(c.border, 0.5) }} />

      <Box>
        <Typography variant="body2" fontWeight={700} sx={{ color: c.text, mb: 0.35 }}>
          Bot messages
        </Typography>
        <Typography variant="caption" sx={{ color: c.textSecondary, display: "block", mb: 1.5, lineHeight: 1.5 }}>
          Leave a field empty to use the platform default. You can also edit greeting or fallback on flow blocks.
        </Typography>
        <Stack spacing={2}>
          {MESSAGE_FIELDS.map((field) => (
            <Box key={field.key}>
              <Typography variant="caption" fontWeight={700} sx={{ color: c.text, display: "block" }}>
                {field.label}
              </Typography>
              <Typography variant="caption" sx={{ color: c.accent, display: "block", mb: 0.5, fontSize: 11 }}>
                When used: {field.when}
              </Typography>
              <InputField
                name={field.key}
                label=""
                placeholder={field.example}
                helperText={`Example: ${field.example}`}
                multiline
                minRows={2}
                dense={isStudio}
                value={(draft[field.key] as string | null) ?? ""}
                onChange={(e) =>
                  setDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          [field.key]: e.target.value.trim() ? e.target.value : null,
                        }
                      : prev,
                  )
                }
                inputProps={{ maxLength: 2000 }}
                sx={fieldSx}
              />
            </Box>
          ))}
        </Stack>
      </Box>

      <Box
        sx={
          isStudio
            ? {
                position: "sticky",
                bottom: 0,
                pt: 1,
                pb: 0.5,
                bgcolor: alpha(c.surface, 0.95),
                backdropFilter: "blur(8px)",
                borderTop: `1px solid ${c.border}`,
                mx: -2,
                px: 2,
              }
            : undefined
        }
      >
        <Button
          type="button"
          variant="primary"
          fullWidth={isStudio}
          disabled={updateMutation.isPending}
          onClick={() => void save()}
        >
          {updateMutation.isPending ? "Saving…" : "Save bot settings"}
        </Button>
      </Box>
    </Stack>
  );
}
