"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import SupportAgentOutlined from "@mui/icons-material/SupportAgentOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { Button, SelectField, Typography } from "@/components/common";
import { DashboardCard } from "@/components/common";
import type { WebsiteAiBehavior } from "@/api/ai-training/ai-training.api";
import {
  useApplyWebsiteAiSetupMutation,
  useWebsiteAiSetupQuery,
} from "@/lib/hooks/query/ai-training/hooks";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { AiTrainingInstructionsEditor } from "./AiTrainingInstructionsEditor";
import { AiTrainingPageShell } from "./AiTrainingPageShell";
import { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";
import {
  aiTrainingCopilotHref,
  aiTrainingListHref,
  aiTrainingTrainHref,
  type AiTrainingSetupScope,
} from "./ai-training-routes";

const TONE_OPTIONS = [
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "FRIENDLY", label: "Friendly" },
  { value: "SALES", label: "Sales-focused" },
];

const DEFAULT_BEHAVIOR: WebsiteAiBehavior = {
  tone: "PROFESSIONAL",
  confidenceThreshold: 0.26,
  strictKbOnly: false,
  autoLearnFromVisitorPages: false,
  parallelScrapePages: false,
  greetingMessage: null,
  noMatchMessage: null,
  lowConfidenceMessage: null,
  llmErrorMessage: null,
  escalationMessage: null,
  partialMatchMessage: null,
  systemInstructions: null,
  chatbotInstructions: null,
  copilotInstructions: null,
};

function parseSetupScope(raw: string | null): AiTrainingSetupScope {
  return raw === "copilot" ? "copilot" : "chatbot";
}

export function AiTrainingWebsiteSetupWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scope = parseSetupScope(searchParams.get("scope"));
  const isCopilot = scope === "copilot";
  const steps = isCopilot
    ? ["Website", "Copilot LLM", "AI instructions"]
    : ["Website", "Chatbot LLM", "AI instructions"];

  const websiteId = searchParams.get("websiteId")?.trim() ?? "";
  const hierarchy = useAiTrainingHierarchy();
  const setupQuery = useWebsiteAiSetupQuery(websiteId, { enabled: Boolean(websiteId) });
  const applyMutation = useApplyWebsiteAiSetupMutation();

  const [step, setStep] = useState(0);
  const [chatbotProfileId, setChatbotProfileId] = useState("");
  const [copilotProfileId, setCopilotProfileId] = useState("");
  const [tone, setTone] = useState<"PROFESSIONAL" | "FRIENDLY" | "SALES">("PROFESSIONAL");
  const [behavior, setBehavior] = useState<WebsiteAiBehavior>(DEFAULT_BEHAVIOR);

  const profiles = setupQuery.data?.profiles ?? [];
  const copilotStatus = setupQuery.data?.copilotStatus;
  const inherits = Boolean(copilotStatus?.inheritsFromChatbotAndAssistant);

  const profileOptions = useMemo(
    () => profiles.map((p) => ({ value: p.id, label: `${p.name} (${p.generationModel})` })),
    [profiles],
  );

  useEffect(() => {
    const id = searchParams.get("websiteId")?.trim();
    if (id) hierarchy.setWebsiteId(id);
  }, [searchParams, hierarchy]);

  useEffect(() => {
    if (!websiteId && hierarchy.websiteId) {
      const params = new URLSearchParams();
      params.set("websiteId", hierarchy.websiteId);
      if (isCopilot) params.set("scope", "copilot");
      router.replace(`/dashboard/ai-training/setup?${params.toString()}`);
    }
  }, [websiteId, hierarchy.websiteId, router, isCopilot]);

  useEffect(() => {
    const s = setupQuery.data?.setup;
    const b = setupQuery.data?.behavior;
    if (!s && !b) return;
    if (s?.chatbotProfileId) setChatbotProfileId(s.chatbotProfileId);
    if (s?.copilotProfileId) setCopilotProfileId(s.copilotProfileId);
    if (s?.tone) setTone(s.tone);
    if (b) setBehavior({ ...DEFAULT_BEHAVIOR, ...b, tone: s?.tone ?? b.tone ?? "PROFESSIONAL" });
  }, [setupQuery.data]);

  useEffect(() => {
    if (isCopilot) {
      if (!copilotProfileId && profiles[0]) setCopilotProfileId(profiles[0].id);
      return;
    }
    if (!chatbotProfileId && profiles[0]) setChatbotProfileId(profiles[0].id);
  }, [profiles, chatbotProfileId, copilotProfileId, isCopilot]);

  const websiteUrl = setupQuery.data?.website.url ?? hierarchy.selectedWebsite?.url ?? "";
  const backHref = isCopilot ? aiTrainingCopilotHref() : aiTrainingListHref("chatbot");
  const backLabel = isCopilot ? "AI Copilot" : "AI Chatbot";

  const submit = async () => {
    if (!websiteId) return;
    if (isCopilot && !copilotProfileId) return;
    if (!isCopilot && !chatbotProfileId) return;

    try {
      await applyMutation.mutateAsync({
        websiteId,
        body: {
          ...(isCopilot
            ? { copilotProfileId }
            : { chatbotProfileId }),
          tone: behavior.tone ?? tone,
          behavior: { ...behavior, tone: behavior.tone ?? tone },
        },
      });
      publishAppToast({
        variant: "success",
        message: isCopilot
          ? "AI Copilot setup saved."
          : "Chatbot setup saved. Add training content next.",
      });
      router.push(isCopilot ? aiTrainingCopilotHref(websiteId) : aiTrainingTrainHref(websiteId));
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Setup failed.",
      });
    }
  };

  if (isCopilot && inherits && websiteId && !setupQuery.isLoading) {
    return (
      <AiTrainingPageShell
        title="AI Copilot"
        subtitle="This website already uses your AI Chatbot and AI Assistant settings."
        icon={<SupportAgentOutlined sx={{ color: "primary.main", fontSize: 28 }} />}
        backHref={backHref}
        backLabel={backLabel}
      >
        <DashboardCard sx={{ p: 2.5 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            AI Copilot is ready for this website. It uses the chatbot LLM profile and assistant
            knowledge — no separate copilot setup is required.
          </Alert>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Chatbot LLM: {setupQuery.data?.setup?.agents.chatbot?.profileName ?? "Configured"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assistant knowledge: trained
            </Typography>
          </Stack>
          <Box sx={{ mt: 3 }}>
            <Button
              type="button"
              variant="primary"
              onClick={() => router.push(aiTrainingCopilotHref(websiteId))}
            >
              Back to AI Copilot
            </Button>
          </Box>
        </DashboardCard>
      </AiTrainingPageShell>
    );
  }

  return (
    <AiTrainingPageShell
      title={isCopilot ? "AI Copilot setup" : "AI Chatbot setup"}
      subtitle={
        isCopilot
          ? "Configure the inbox copilot LLM and instructions. Skip this if chatbot and assistant are already set up."
          : "Choose the chatbot LLM model and instructions. Add knowledge training after setup."
      }
      icon={
        isCopilot ? (
          <SupportAgentOutlined sx={{ color: "primary.main", fontSize: 28 }} />
        ) : (
          <PsychologyOutlined sx={{ color: "primary.main", fontSize: 28 }} />
        )
      }
      backHref={backHref}
      backLabel={backLabel}
    >
      {applyMutation.isPending || setupQuery.isLoading ? (
        <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
      ) : null}

      {isCopilot && copilotStatus && !copilotStatus.chatbotConfigured ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Set up AI Chatbot first, then train AI Assistant knowledge. Copilot can inherit both
          automatically — or configure a dedicated copilot profile here.
        </Alert>
      ) : null}

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <DashboardCard sx={{ p: 2.5 }}>
        {step === 0 ? (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Select the website for this {isCopilot ? "copilot" : "chatbot"} configuration.
            </Typography>
            <SelectField
              label="Reseller"
              value={hierarchy.resellerId}
              onChange={hierarchy.onResellerChange}
              options={hierarchy.resellerSelectOptions}
              disabled={Boolean(hierarchy.sessionResellerId && !hierarchy.mayPickResellerFilter)}
            />
            <SelectField
              label="Parent company"
              value={hierarchy.parentCompanyId}
              onChange={hierarchy.onParentChange}
              options={hierarchy.parentCompanyOptions}
            />
            <SelectField
              label="Child company"
              value={hierarchy.childCompanyId}
              onChange={hierarchy.onChildChange}
              options={hierarchy.childCompanyOptions}
            />
            <SelectField
              label="Website"
              value={hierarchy.websiteId}
              onChange={hierarchy.setWebsiteId}
              options={hierarchy.websiteOptions}
            />
            {websiteUrl ? (
              <Alert severity="info">Registered URL: {websiteUrl}</Alert>
            ) : null}
          </Stack>
        ) : null}

        {step === 1 ? (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {isCopilot
                ? "Pick which platform LLM profile powers the inbox AI copilot for agents."
                : "Pick which platform LLM profile powers the visitor chatbot for this website."}
            </Typography>
            <SelectField
              label="Tone"
              value={tone}
              onChange={(v) => {
                const t = v as typeof tone;
                setTone(t);
                setBehavior((b) => ({ ...b, tone: t }));
              }}
              options={TONE_OPTIONS}
            />
            <Box sx={{ p: 2, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.1)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                {isCopilot ? (
                  <SupportAgentOutlined color="primary" />
                ) : (
                  <SmartToyOutlined color="primary" />
                )}
                <Typography fontWeight={700}>
                  {isCopilot ? "AI Copilot" : "Visitor chatbot"}
                </Typography>
              </Box>
              <SelectField
                label={isCopilot ? "Copilot LLM profile" : "Chatbot LLM profile"}
                value={isCopilot ? copilotProfileId : chatbotProfileId}
                onChange={isCopilot ? setCopilotProfileId : setChatbotProfileId}
                options={profileOptions}
              />
            </Box>
            {profileOptions.length === 0 ? (
              <Alert severity="warning">
                No model profiles available — configure platform provider keys first.
              </Alert>
            ) : null}
          </Stack>
        ) : null}

        {step === 2 ? (
          <AiTrainingInstructionsEditor
            behavior={behavior}
            onChange={setBehavior}
            instructionScope={isCopilot ? "copilot" : "chatbot"}
          />
        ) : null}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button
            type="button"
            variant="secondary"
            disabled={step === 0 || applyMutation.isPending}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 0 && !websiteId) ||
                (step === 1 &&
                  (isCopilot ? !copilotProfileId : !chatbotProfileId))
              }
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              disabled={applyMutation.isPending || !websiteId}
              onClick={() => void submit()}
            >
              {applyMutation.isPending ? "Saving…" : "Save setup"}
            </Button>
          )}
        </Box>
      </DashboardCard>
    </AiTrainingPageShell>
  );
}
