"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import type { WebsiteAiBehavior } from "@/api/ai-training/ai-training.api";
import { AI_INSTRUCTION_TEMPLATES } from "./ai-instruction-templates";

const TONE_OPTIONS = [
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "FRIENDLY", label: "Friendly" },
  { value: "SALES", label: "Sales-focused" },
];

export function AiTrainingInstructionsEditor({
  behavior,
  onChange,
  instructionScope = "both",
}: {
  behavior: WebsiteAiBehavior;
  onChange: (next: WebsiteAiBehavior) => void;
  /** @deprecated use instructionScope */
  showRoleSpecific?: boolean;
  instructionScope?: "chatbot" | "copilot" | "both";
}) {
  const showChatbot =
    instructionScope === "both" || instructionScope === "chatbot";
  const showCopilot =
    instructionScope === "both" || instructionScope === "copilot";
  const applyTemplate = (templateId: string) => {
    const t = AI_INSTRUCTION_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    onChange({
      ...behavior,
      systemInstructions: t.systemInstructions,
      chatbotInstructions: t.chatbotInstructions ?? behavior.chatbotInstructions,
      copilotInstructions: t.copilotInstructions ?? behavior.copilotInstructions,
      tone:
        templateId === "sales"
          ? "SALES"
          : templateId === "support"
            ? "FRIENDLY"
            : "PROFESSIONAL",
    });
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
          Complete AI instructions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Tell the AI how to react — sales style, tone, do/don&apos;t rules. This is
          injected into every LLM reply before training content is used.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
          {AI_INSTRUCTION_TEMPLATES.map((t) => (
            <Button
              key={t.id}
              type="button"
              variant="secondary"
              size="small"
              onClick={() => applyTemplate(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </Box>
        <InputField
          label="System instructions (shared)"
          value={behavior.systemInstructions ?? ""}
          onChange={(e) =>
            onChange({ ...behavior, systemInstructions: e.target.value || null })
          }
          multiline
          minRows={8}
          placeholder="Example: You are the sales assistant for Acme Corp. Always ask what the visitor needs first..."
        />
      </Box>

      {showChatbot ? (
        <InputField
          label="Extra instructions — visitor chatbot"
          value={behavior.chatbotInstructions ?? ""}
          onChange={(e) =>
            onChange({ ...behavior, chatbotInstructions: e.target.value || null })
          }
          multiline
          minRows={3}
          placeholder="Additional rules for the public website chatbot"
        />
      ) : null}
      {showCopilot ? (
        <InputField
          label="Extra instructions — AI copilot"
          value={behavior.copilotInstructions ?? ""}
          onChange={(e) =>
            onChange({ ...behavior, copilotInstructions: e.target.value || null })
          }
          multiline
          minRows={3}
          placeholder="Additional rules for the inbox AI copilot"
        />
      ) : null}

      <SelectField
        label="Tone preset"
        value={behavior.tone ?? "PROFESSIONAL"}
        onChange={(v) =>
          onChange({ ...behavior, tone: v as WebsiteAiBehavior["tone"] })
        }
        options={TONE_OPTIONS}
      />

      <Typography variant="body2" fontWeight={700} sx={{ pt: 1 }}>
        Fallback messages
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        Used when the AI skips LLM or confidence is low — not the main instruction block.
      </Typography>
      <InputField
        label="Greeting (hi / hello)"
        value={behavior.greetingMessage ?? ""}
        onChange={(e) =>
          onChange({ ...behavior, greetingMessage: e.target.value || null })
        }
      />
      <InputField
        label="No training match"
        value={behavior.noMatchMessage ?? ""}
        onChange={(e) =>
          onChange({ ...behavior, noMatchMessage: e.target.value || null })
        }
      />
      <InputField
        label="Low confidence"
        value={behavior.lowConfidenceMessage ?? ""}
        onChange={(e) =>
          onChange({ ...behavior, lowConfidenceMessage: e.target.value || null })
        }
      />
      <InputField
        label="Talk to agent"
        value={behavior.escalationMessage ?? ""}
        onChange={(e) =>
          onChange({ ...behavior, escalationMessage: e.target.value || null })
        }
      />
      <InputField
        label="AI unavailable"
        value={behavior.llmErrorMessage ?? ""}
        onChange={(e) =>
          onChange({ ...behavior, llmErrorMessage: e.target.value || null })
        }
      />
    </Stack>
  );
}
