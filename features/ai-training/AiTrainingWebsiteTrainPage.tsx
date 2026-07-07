"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import { Button, DashboardCard, Typography } from "@/components/common";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import {
  useApplyWebsiteAiTrainingMutation,
  useWebsiteAiSetupQuery,
} from "@/lib/hooks/query/ai-training/hooks";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { AiTrainingFaqBuilder } from "./AiTrainingFaqBuilder";
import { AiTrainingPageShell } from "./AiTrainingPageShell";
import {
  aiTrainingListHref,
  aiTrainingManageHref,
  aiTrainingSetupHref,
} from "./ai-training-routes";
import { createEmptyFaqRow, countValidFaqRows, type FaqBuilderRow } from "./faq-builder.utils";
import { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

const CHAT_EXPORT_PLACEHOLDER = `visitor: Hi, I need help with my order
agent: Sure! What is your order number?
visitor: ORD-12345
agent: Thanks — I see it shipped yesterday. Tracking link is in your email.`;

const CHAT_EXPORT_MAX_CHARS = 500_000;

export function AiTrainingWebsiteTrainPage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("websiteId")?.trim() ?? "";
  const hierarchy = useAiTrainingHierarchy();
  const setupQuery = useWebsiteAiSetupQuery(websiteId, { enabled: Boolean(websiteId) });
  const trainMutation = useApplyWebsiteAiTrainingMutation();

  const [enableScrape, setEnableScrape] = useState(false);
  const [chatbotFaqs, setChatbotFaqs] = useState<FaqBuilderRow[]>([createEmptyFaqRow()]);
  const [chatExportText, setChatExportText] = useState("");

  useEffect(() => {
    const id = searchParams.get("websiteId")?.trim();
    if (id) hierarchy.setWebsiteId(id);
  }, [searchParams, hierarchy]);

  useEffect(() => {
    if (!websiteId && hierarchy.websiteId) {
      router.replace(`/dashboard/ai-training/train?websiteId=${encodeURIComponent(hierarchy.websiteId)}`);
    }
  }, [websiteId, hierarchy.websiteId, router]);

  useEffect(() => {
    if (!websiteId) {
      router.replace(aiTrainingSetupHref(undefined, "chatbot"));
    }
  }, [websiteId, router]);

  const websiteUrl = setupQuery.data?.website.url ?? hierarchy.selectedWebsite?.url ?? "";
  const siteName = setupQuery.data?.website.name ?? hierarchy.selectedWebsite?.name ?? "Website";

  const hasFaqs = countValidFaqRows(chatbotFaqs) > 0;
  const hasChat = Boolean(chatExportText.trim());
  const hasTrainingSelection = enableScrape || hasFaqs || hasChat;

  const handleChatFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    setChatExportText(text.slice(0, CHAT_EXPORT_MAX_CHARS));
  };

  const handleChatTextChange = (value: string) => {
    setChatExportText(value.slice(0, CHAT_EXPORT_MAX_CHARS));
  };

  const submitTraining = async () => {
    if (!websiteId || !hasTrainingSelection) return;
    const chatbotFaqRows = chatbotFaqs
      .filter((r) => r.question.trim() && r.answer.trim())
      .map((r) => ({ question: r.question.trim(), answer: r.answer.trim() }));

    try {
      const result = await trainMutation.mutateAsync({
        websiteId,
        body: {
          ...(enableScrape
            ? { enableScrape: true, scrapeUrl: websiteUrl || undefined }
            : {}),
          ...(chatbotFaqRows.length ? { chatbotFaqRows } : {}),
          ...(hasChat
            ? {
                chatExportText: chatExportText.trim(),
                trainChatbotFromChat: true,
                trainCopilotFromChat: false,
              }
            : {}),
        },
      });
      publishAppToast({
        variant: "success",
        message: `Chatbot training started. ${result.sourceJobs.length} job(s) queued.`,
      });
      router.push(aiTrainingManageHref("chatbot", websiteId));
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Training failed.",
      });
    }
  };

  const skipHref = useMemo(
    () => (websiteId ? aiTrainingManageHref("chatbot", websiteId) : aiTrainingListHref("chatbot")),
    [websiteId],
  );

  return (
    <AiTrainingPageShell
      title={`Train chatbot — ${siteName}`}
      subtitle="Visitor chatbot knowledge only. Use AI Assistant for internal knowledge and AI Copilot for inbox agent settings."
      icon={<SmartToyOutlined sx={{ color: "primary.main", fontSize: 28 }} />}
      backHref={skipHref}
      backLabel="Skip for now"
    >
      {trainMutation.isPending || setupQuery.isLoading ? (
        <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
      ) : null}

      <DashboardCard sx={{ p: 2.5 }}>
        <Stack spacing={3}>
          <Alert severity="info">
            This page trains the visitor chatbot only. Assistant knowledge is managed under
            AI Assistant; inbox copilot settings are under AI Copilot.
          </Alert>

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <CloudUploadOutlined color="primary" fontSize="small" />
              <Typography fontWeight={700}>1. Chat upload</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Upload past visitor chats (.txt, .csv, .json) or paste a transcript below. Prefix
              each line with <strong>visitor:</strong> (customer) or <strong>agent:</strong>{" "}
              (live support).
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Button
                type="button"
                variant="secondary"
                component="label"
                startIcon={<CloudUploadOutlined />}
              >
                Choose chat export file
                <input
                  type="file"
                  hidden
                  accept=".txt,.csv,.json"
                  onChange={(e) => void handleChatFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              {hasChat ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => setChatExportText("")}
                >
                  Clear chat text
                </Button>
              ) : null}
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 2, mb: 0.75 }}
            >
              Or paste transcript
            </Typography>
            <TextField
              value={chatExportText}
              onChange={(e) => handleChatTextChange(e.target.value)}
              placeholder={CHAT_EXPORT_PLACEHOLDER}
              multiline
              minRows={8}
              fullWidth
              sx={textFieldStyles(theme)}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.75 }}
            >
              One message per line. Visitor aliases: user, customer, client. Agent aliases:
              human, staff, support. JSON array with role and content is also supported.
            </Typography>
            {hasChat ? (
              <Typography
                variant="caption"
                color="success.main"
                sx={{ display: "block", mt: 0.75 }}
              >
                {chatExportText.length.toLocaleString()} characters ready for chatbot training
              </Typography>
            ) : null}
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <LanguageOutlined color="primary" fontSize="small" />
              <Typography fontWeight={700}>2. Website scraping</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Auto-scrape the registered website URL for visitor chatbot knowledge.
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableScrape}
                  onChange={(_, v) => setEnableScrape(v)}
                  disabled={!websiteUrl.trim()}
                />
              }
              label={
                websiteUrl.trim()
                  ? `Scrape ${websiteUrl}`
                  : "Set a website URL before scraping"
              }
            />
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <MenuBookOutlined color="primary" fontSize="small" />
              <Typography fontWeight={700}>3. Visitor FAQs</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Q&A pairs for the public website chatbot.
            </Typography>
            <AiTrainingFaqBuilder
              rows={chatbotFaqs}
              onRowsChange={setChatbotFaqs}
              onCompiledChange={() => {}}
              variant="chatbot"
            />
          </Box>
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: 2, flexWrap: "wrap" }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(skipHref)}
          >
            Skip — train later
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={trainMutation.isPending || !websiteId || !hasTrainingSelection}
            onClick={() => void submitTraining()}
          >
            {trainMutation.isPending ? "Starting…" : "Start chatbot training"}
          </Button>
        </Box>
      </DashboardCard>
    </AiTrainingPageShell>
  );
}
