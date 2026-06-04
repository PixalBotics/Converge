"use client";

import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";

const COPY: Record<
  AiTrainingKbVariant,
  { steps: string[]; note: string }
> = {
  chatbot: {
    steps: [
      "Pick a website and paste your site URL (or FAQs) — we scrape automatically.",
      "Each add creates a content item. The system reads it and stores searchable pieces.",
      "When a visitor chats on the widget, the bot answers from those pieces for that website only.",
    ],
    note: "Training content is separate from AI Assistant (agent copilot) knowledge.",
  },
  assistant: {
    steps: [
      "Pick a website and paste your site URL, FAQs, PDFs, Word, Excel, or SOP text for agents.",
      "Each add creates a content item, split into searchable pieces.",
      "Agents see answers in the copilot — this does not change the public chatbot.",
    ],
    note: "Website scrape for assistant is separate from chatbot training. Assistant content is not shown to visitors.",
  },
};

export function AiTrainingHowItWorks({ variant }: { variant: AiTrainingKbVariant }) {
  const theme = useTheme() as AppTheme;
  const { steps, note } = COPY[variant];

  return (
    <Alert severity="info" variant="outlined" sx={{ bgcolor: "transparent", borderColor: theme.app.dashboard.cardBorder }}>
      <strong>How it works</strong>
      <ol style={{ margin: "8px 0 0", paddingLeft: 20 }}>
        {steps.map((step) => (
          <li key={step} style={{ marginBottom: 4 }}>
            {step}
          </li>
        ))}
      </ol>
      <span style={{ display: "block", marginTop: 8, opacity: 0.9 }}>{note}</span>
    </Alert>
  );
}
