"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { WebsiteAiBehavior } from "@/api/ai-training/ai-training.api";
import { Button, InputField, Typography } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  useAiTrainingBehaviorQuery,
  useUpdateAiTrainingBehaviorMutation,
} from "@/lib/hooks/query/ai-training/hooks";

const FALLBACK_FIELDS: {
  key: keyof WebsiteAiBehavior;
  label: string;
  helper: string;
  multiline?: boolean;
}[] = [
  {
    key: "greetingMessage",
    label: "Greeting reply",
    helper: "When visitor says hi/hello only.",
    multiline: true,
  },
  {
    key: "noMatchMessage",
    label: "No knowledge match",
    helper: "When nothing relevant is found in training.",
    multiline: true,
  },
  {
    key: "lowConfidenceMessage",
    label: "Low confidence",
    helper: "When match score is below threshold (strict mode).",
    multiline: true,
  },
  {
    key: "llmErrorMessage",
    label: "AI unavailable",
    helper: "When the LLM provider fails.",
    multiline: true,
  },
  {
    key: "escalationMessage",
    label: "Talk to agent",
    helper: "When visitor asks for a human.",
    multiline: true,
  },
  {
    key: "partialMatchMessage",
    label: "Partial match excerpt",
    helper: "Optional fixed reply instead of auto excerpt from KB.",
    multiline: true,
  },
];

export function AiTrainingBehaviorPanel({ websiteId }: { websiteId: string }) {
  const theme = useTheme() as AppTheme;
  const behaviorQuery = useAiTrainingBehaviorQuery(websiteId);
  const updateMutation = useUpdateAiTrainingBehaviorMutation();
  const [draft, setDraft] = useState<WebsiteAiBehavior | null>(null);

  useEffect(() => {
    if (behaviorQuery.data) setDraft(behaviorQuery.data);
  }, [behaviorQuery.data]);

  if (behaviorQuery.isLoading || !draft) {
    return (
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
        Loading AI behavior settings…
      </Typography>
    );
  }

  const globalHint = "Leave blank to use platform defaults.";

  const save = async () => {
    try {
      await updateMutation.mutateAsync({ websiteId, body: draft });
      publishAppToast({ variant: "success", message: "AI fallback messages saved." });
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Could not save settings.",
      });
    }
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
          Confidence threshold
        </Typography>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
          Minimum KB match score (0–1). Higher = stricter answers.
        </Typography>
        <Slider
          size="small"
          min={0.1}
          max={0.6}
          step={0.02}
          value={draft.confidenceThreshold ?? 0.26}
          onChange={(_, v) =>
            setDraft((d) =>
              d ? { ...d, confidenceThreshold: typeof v === "number" ? v : v[0] } : d,
            )
          }
          valueLabelDisplay="auto"
        />
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={draft.strictKbOnly}
            onChange={(e) =>
              setDraft((d) => (d ? { ...d, strictKbOnly: e.target.checked } : d))
            }
            size="small"
          />
        }
        label={
          <Typography variant="body2">
            Strict KB only — skip LLM when confidence is low
          </Typography>
        }
      />

      {FALLBACK_FIELDS.map((field) => (
        <InputField
          key={field.key}
          name={field.key}
          label={field.label}
          helperText={`${field.helper} ${globalHint}`}
          multiline={field.multiline}
          minRows={field.multiline ? 2 : undefined}
          value={(draft[field.key] as string | null) ?? ""}
          onChange={(e) =>
            setDraft((d) =>
              d
                ? {
                    ...d,
                    [field.key]: e.target.value.trim() ? e.target.value : null,
                  }
                : d,
            )
          }
          inputProps={{ maxLength: 2000 }}
        />
      ))}

      <Button
        type="button"
        variant="primary"
        disabled={updateMutation.isPending}
        onClick={() => void save()}
      >
        {updateMutation.isPending ? "Saving…" : "Save fallback messages"}
      </Button>
    </Stack>
  );
}
