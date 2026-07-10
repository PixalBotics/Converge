"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";
import {
  aiTrainingHowItWorksGridSx,
  aiTrainingHowItWorksStepSx,
  aiTrainingMainCardSx,
} from "./ai-training-ui.styles";

const COPY: Record<
  AiTrainingKbVariant,
  { steps: { title: string; detail: string }[] }
> = {
  chatbot: {
    steps: [
      {
        title: "Add content",
        detail: "Pick a website and add your site URL, sitemap, or FAQs.",
      },
      {
        title: "We index it",
        detail: "Content is read and split into searchable pieces automatically.",
      },
      {
        title: "Visitors get answers",
        detail: "The chat widget uses this knowledge to reply on that website.",
      },
    ],
  },
  assistant: {
    steps: [
      {
        title: "Add content",
        detail: "Add site URLs, FAQs, PDFs, Word docs, or SOP text per website.",
      },
      {
        title: "We index it",
        detail: "Each item becomes searchable knowledge for your team.",
      },
      {
        title: "Agents get help",
        detail: "Copilot in live chat suggests answers from this knowledge.",
      },
    ],
  },
};

const ACCENT_KEYS = ["accentIndigo", "accentGreen", "accentOrange"] as const;

export function AiTrainingHowItWorks({ variant }: { variant: AiTrainingKbVariant }) {
  const theme = useTheme() as AppTheme;
  const { steps } = COPY[variant];

  return (
    <DashboardCard sx={aiTrainingMainCardSx}>
      <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary, mb: 1.25 }}>
        How it works
      </Typography>
      <Box sx={aiTrainingHowItWorksGridSx}>
        {steps.map((step, index) => {
          const accent = theme.app.dashboard[ACCENT_KEYS[index] ?? "accentIndigo"];
          return (
            <Box key={step.title} sx={aiTrainingHowItWorksStepSx(accent)}>
              <Typography
                variant="caption"
                sx={{ color: accent, fontWeight: 700, display: "block", mb: 0.5 }}
              >
                Step {index + 1}
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
                {step.title}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
                {step.detail}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </DashboardCard>
  );
}
