"use client";

import { useEffect, useState, type ReactNode } from "react";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import MessageOutlined from "@mui/icons-material/MessageOutlined";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import SupportAgentOutlined from "@mui/icons-material/SupportAgentOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import WavingHandOutlined from "@mui/icons-material/WavingHandOutlined";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  useAiTrainingAutomationFlowQuery,
  useAiTrainingBehaviorQuery,
  useSaveAiTrainingAutomationFlowMutation,
  useUpdateAiTrainingBehaviorMutation,
} from "@/lib/hooks/query/ai-training/hooks";
import { defaultFlowGraph } from "./ai-flow-builder.storage";
import type { FlowBuilderGraph } from "./ai-flow-builder.types";
import {
  applySimpleSetupToFlowGraph,
  readSimpleSetupDraft,
  simpleSetupToBehaviorBody,
  type SimpleSetupDraft,
} from "./ai-flow-sync.util";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";
import { aiTrainingManageHref } from "./ai-training-routes";
import {
  aiTrainingSettingsFieldSx,
  aiTrainingSettingsSliderSx,
} from "./ai-training-studio.styles";
import { studioColors } from "./ai-training-studio.tokens";

const STEPS = ["Train", "Replies", "Test"];

const QUICK_TESTS = [
  { label: "Say hi", message: "hi" },
  { label: "Ask a question", message: "What services do you offer?" },
  { label: "Not sure path", message: "asdfghjkl random nonsense xyz" },
  { label: "Talk to agent", message: "I want to talk to a human agent" },
];

function ReplyCard({
  icon,
  title,
  subtitle,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: string;
  children: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const c = studioColors(theme);
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        bgcolor: c.surfaceMuted,
        border: `1px solid ${c.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: `${accent}18`,
            color: accent,
            border: `1px solid ${accent}33`,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={700} sx={{ color: c.text }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: d.textMuted, lineHeight: 1.45, display: "block" }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>
      {children}
    </Box>
  );
}

export function AiTrainingSimpleSetupPanel({
  websiteId,
  variant,
  indexedCount,
  onQuickTest,
}: {
  websiteId: string;
  variant: AiTrainingKbVariant;
  indexedCount: number;
  onQuickTest: (message: string) => void;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const c = studioColors(theme);
  const [activeStep, setActiveStep] = useState(1);
  const [draft, setDraft] = useState<SimpleSetupDraft | null>(null);

  const behaviorQuery = useAiTrainingBehaviorQuery(websiteId);
  const flowQuery = useAiTrainingAutomationFlowQuery(websiteId, variant);
  const updateBehavior = useUpdateAiTrainingBehaviorMutation();
  const saveFlow = useSaveAiTrainingAutomationFlowMutation();

  useEffect(() => {
    if (behaviorQuery.data) {
      setDraft(readSimpleSetupDraft(behaviorQuery.data, (flowQuery.data as FlowBuilderGraph | undefined) ?? null));
    }
  }, [behaviorQuery.data, flowQuery.data]);

  const trainingReady = indexedCount > 0;
  const saving = updateBehavior.isPending || saveFlow.isPending;

  const saveAll = async () => {
    if (!draft) return;
    try {
      await updateBehavior.mutateAsync({
        websiteId,
        body: simpleSetupToBehaviorBody(draft),
      });
      const baseGraph = (flowQuery.data as FlowBuilderGraph | undefined) ?? defaultFlowGraph();
      const syncedGraph = applySimpleSetupToFlowGraph(baseGraph, draft);
      await saveFlow.mutateAsync({ websiteId, variant, graph: syncedGraph });
      publishAppToast({ variant: "success", message: "Bot replies saved." });
      setActiveStep(2);
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Could not save.",
      });
    }
  };

  if (!draft || behaviorQuery.isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" sx={{ color: d.textMuted }}>
          Loading setup…
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        px: { xs: 2, md: 3 },
        py: 2.5,
      }}
    >
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: c.text, mb: 0.5 }}>
          Simple bot setup
        </Typography>
        <Typography variant="body2" sx={{ color: d.textMuted, mb: 2.5, lineHeight: 1.5 }}>
          No wires or nodes needed. Set your replies, save once, then test with the chat widget.
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {STEPS.map((label, i) => (
            <Step key={label} completed={i < activeStep}>
              <StepLabel
                onClick={() => setActiveStep(i)}
                sx={{
                  cursor: "pointer",
                  "& .MuiStepLabel-label": { color: d.textMuted, fontSize: 13 },
                  "& .MuiStepLabel-label.Mui-active": { color: c.text, fontWeight: 700 },
                  "& .MuiStepLabel-label.Mui-completed": { color: c.textSoft },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: trainingReady
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.warning.main, 0.1),
                border: `1px solid ${alpha(trainingReady ? theme.palette.success.main : theme.palette.warning.main, 0.3)}`,
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
              }}
            >
              {trainingReady ? (
                <CheckCircleOutlineRounded sx={{ color: theme.palette.success.light, fontSize: 28 }} />
              ) : (
                <MenuBookOutlined sx={{ color: theme.palette.warning.light, fontSize: 28 }} />
              )}
              <Box>
                <Typography variant="body1" fontWeight={700} sx={{ color: c.text }}>
                  {trainingReady ? "Training content ready" : "Add training content first"}
                </Typography>
                <Typography variant="body2" sx={{ color: d.textMuted, mt: 0.5, lineHeight: 1.5 }}>
                  {trainingReady
                    ? `${indexedCount} source(s) indexed. The bot answers from this content.`
                    : "Without indexed training, the bot can only use your fallback replies."}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  window.open(aiTrainingManageHref(variant, websiteId), "_self")
                }
              >
                {trainingReady ? "Manage training" : "Add training sources"}
              </Button>
              <Button type="button" variant="primary" onClick={() => setActiveStep(1)}>
                Continue to replies
              </Button>
            </Box>
          </Box>
        ) : null}

        {activeStep === 1 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <ReplyCard
              icon={<WavingHandOutlined />}
              title="Welcome reply"
              subtitle="When visitor says hi or hello."
              accent="#8b5cf6"
            >
              <InputField
                name="greeting"
                label="Message"
                multiline
                minRows={2}
                dense
                value={draft.greetingMessage}
                onChange={(e) =>
                  setDraft((p) => (p ? { ...p, greetingMessage: e.target.value } : p))
                }
                placeholder="Hello! Welcome to our site. How can I help you today?"
                sx={aiTrainingSettingsFieldSx}
              />
            </ReplyCard>

            <ReplyCard
              icon={<MessageOutlined />}
              title="Not sure reply"
              subtitle="When the bot cannot find a good answer in your training."
              accent="#f97316"
            >
              <InputField
                name="notSure"
                label="Message"
                multiline
                minRows={2}
                dense
                value={draft.notSureMessage}
                onChange={(e) =>
                  setDraft((p) => (p ? { ...p, notSureMessage: e.target.value } : p))
                }
                placeholder="I'm not fully sure about that. Please ask another way or contact our team."
                sx={aiTrainingSettingsFieldSx}
              />
            </ReplyCard>

            <ReplyCard
              icon={<SupportAgentOutlined />}
              title="Talk to human"
              subtitle='When visitor asks for an agent (e.g. "talk to agent").'
              accent="#ef4444"
            >
              <InputField
                name="escalation"
                label="Message"
                multiline
                minRows={2}
                dense
                value={draft.escalationMessage}
                onChange={(e) =>
                  setDraft((p) => (p ? { ...p, escalationMessage: e.target.value } : p))
                }
                placeholder="Connecting you with our team. A live agent will assist you shortly."
                sx={aiTrainingSettingsFieldSx}
              />
            </ReplyCard>

            <ReplyCard
              icon={<TuneOutlined />}
              title="How strict should answers be?"
              subtitle="Higher = bot must be more confident before answering from training."
              accent={d.accentBlue}
            >
              <Box sx={{ px: 0.5, pt: 0.5 }}>
                <Slider
                  size="small"
                  min={0.1}
                  max={0.6}
                  step={0.02}
                  value={draft.confidenceThreshold}
                  onChange={(_, v) =>
                    setDraft((p) =>
                      p
                        ? {
                            ...p,
                            confidenceThreshold: typeof v === "number" ? v : v[0],
                          }
                        : p,
                    )
                  }
                  valueLabelDisplay="auto"
                  sx={aiTrainingSettingsSliderSx}
                />
                <Typography variant="caption" sx={{ color: d.textMuted, display: "block", mt: 0.5 }}>
                  Relaxed (0.1) ← → Strict (0.6) · current {draft.confidenceThreshold.toFixed(2)}
                </Typography>
              </Box>
              <FormControlLabel
                sx={{ m: 0, alignItems: "flex-start" }}
                control={
                  <Checkbox
                    size="small"
                    checked={draft.strictKbOnly}
                    onChange={(e) =>
                      setDraft((p) => (p ? { ...p, strictKbOnly: e.target.checked } : p))
                    }
                    sx={{
                      color: d.textMuted,
                      "&.Mui-checked": { color: d.accentBlue },
                      mt: 0.15,
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: c.text }}>
                      Strict KB only
                    </Typography>
                    <Typography variant="caption" sx={{ color: d.textMuted, lineHeight: 1.4 }}>
                      Never use AI generation when confidence is low — always show not-sure reply.
                    </Typography>
                  </Box>
                }
              />
            </ReplyCard>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", pt: 0.5 }}>
              <Button type="button" variant="secondary" onClick={() => setActiveStep(0)}>
                Back
              </Button>
              <Button type="button" variant="primary" disabled={saving} onClick={() => void saveAll()}>
                {saving ? "Saving…" : "Save & continue to test"}
              </Button>
            </Box>
          </Box>
        ) : null}

        {activeStep === 2 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: alpha(d.blueTintBg, 0.5),
                border: `1px solid ${alpha(d.accentBlue, 0.25)}`,
              }}
            >
              <Typography variant="body2" fontWeight={700} sx={{ color: c.text, mb: 0.75 }}>
                Use the chat widget (bottom-left)
              </Typography>
              <Typography variant="caption" sx={{ color: d.textMuted, lineHeight: 1.5, display: "block", mb: 1.5 }}>
                Or tap a quick test below — the message sends automatically and highlights the bot path.
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {QUICK_TESTS.map((t) => (
                  <Button
                    key={t.label}
                    type="button"
                    variant="secondary"
                    size="small"
                    startIcon={<PlayArrowRounded sx={{ fontSize: 16 }} />}
                    onClick={() => onQuickTest(t.message)}
                  >
                    {t.label}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button type="button" variant="secondary" onClick={() => setActiveStep(1)}>
                Edit replies
              </Button>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
