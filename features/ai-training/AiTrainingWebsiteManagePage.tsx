"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AutoStories from "@mui/icons-material/AutoStories";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { KnowledgeSourceStatus } from "@/api/ai-knowledge/types";
import { Button, DashboardCard, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import {
  useAiAssistantKbReindexMutation,
  useAiAssistantKbSourcesQuery,
  useAiAssistantKbTrainingWebsitesQuery,
  useAiChatbotReindexMutation,
  useAiChatbotSourcesQuery,
  useAiChatbotTrainingWebsitesQuery,
  useDeleteAiAssistantKbSourceMutation,
  useDeleteAiChatbotSourceMutation,
} from "@/lib/hooks/query/ai-knowledge";
import {
  useAiTrainingBehaviorQuery,
  useUpdateAiTrainingBehaviorMutation,
} from "@/lib/hooks/query/ai-training/hooks";
import { AiTrainingPageShell } from "./AiTrainingPageShell";
import { AiTrainingStudioHeaderTabs } from "./AiTrainingStudioHeaderTabs";
import { AiTrainingSourcePreview } from "./AiTrainingSourcePreview";
import { AiTrainingNonWebProcessingCard } from "./AiTrainingNonWebProcessingCard";
import { AiTrainingParallelScrapeToggle } from "./AiTrainingParallelScrapeToggle";
import { AiTrainingScrapeStatusCard } from "./AiTrainingScrapeStatusCard";
import { AiTrainingSourcesTable } from "./AiTrainingSourcesTable";
import { WebsiteAiConfigModal } from "./WebsiteAiConfigModal";
import { usePlatformLlmAccess } from "./hooks/usePlatformLlmAccess";
import {
  aiTrainingAddHref,
  aiTrainingListHref,
  aiTrainingTestStudioHref,
} from "./ai-training-routes";
import {
  hostFromWebsiteUrl,
  isReindexBulkResult,
  KB_TRAINING_SOURCES_POLL_MS,
  isWebSourceType,
  toastMessageForCreateResult,
  type AiTrainingKbVariant,
} from "./ai-training-kb.utils";
import { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";
import { buildAiTrainingSessionScope } from "./ai-training-scope.util";
import { useAuth } from "@/lib/auth";
import { AI_ASSISTANT_PRODUCT, AI_CHATBOT_PRODUCT } from "@/lib/ai/ai-role-copy";
import { aiTrainingQuickActionsSx } from "./ai-training-ui.styles";

const LIST_LIMIT = 20;

export function AiTrainingWebsiteManagePage({ variant }: { variant: AiTrainingKbVariant }) {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const websiteIdParam = searchParams.get("websiteId")?.trim() ?? "";

  const isChatbot = variant === "chatbot";
  const HeaderIcon = isChatbot ? SmartToyOutlined : AutoStories;
  const listHref = aiTrainingListHref(variant);

  const hierarchy = useAiTrainingHierarchy();
  const { user } = useAuth();
  const sessionScope = useMemo(() => buildAiTrainingSessionScope(user), [user]);
  const [statusFilter, setStatusFilter] = useState("");
  const [listOffset, setListOffset] = useState(0);
  const [reindexIncludeFailed, setReindexIncludeFailed] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [previewSourceId, setPreviewSourceId] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const { canManage: canManageAiConfig } = usePlatformLlmAccess();

  const chatbotTrainingWebsites = useAiChatbotTrainingWebsitesQuery(
    { limit: 500, trainedOnly: false, ...sessionScope },
    { enabled: isChatbot },
  );
  const assistantTrainingWebsites = useAiAssistantKbTrainingWebsitesQuery(
    { limit: 500, trainedOnly: false, ...sessionScope },
    { enabled: !isChatbot },
  );
  const trainingWebsitesQuery = isChatbot ? chatbotTrainingWebsites : assistantTrainingWebsites;

  const deleteChatbot = useDeleteAiChatbotSourceMutation();
  const deleteAssistant = useDeleteAiAssistantKbSourceMutation();
  const reindexChatbot = useAiChatbotReindexMutation();
  const reindexAssistant = useAiAssistantKbReindexMutation();

  const websiteId = hierarchy.websiteId.trim() || websiteIdParam;
  const behaviorQuery = useAiTrainingBehaviorQuery(websiteId || undefined);
  const updateBehavior = useUpdateAiTrainingBehaviorMutation();
  const registeredUrl = hierarchy.selectedWebsite?.url ?? "";
  const registeredHost = hostFromWebsiteUrl(registeredUrl);

  useEffect(() => {
    if (!websiteIdParam || synced) return;
    const row = trainingWebsitesQuery.data?.items.find((i) => i.websiteId === websiteIdParam);
    if (row) {
      hierarchy.selectWebsiteFromTrainingRow(row);
      setSynced(true);
    }
    // hierarchy selectors are stable enough for one-time sync from URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteIdParam, trainingWebsitesQuery.data?.items, synced]);

  useEffect(() => {
    if (!websiteIdParam) {
      router.replace(listHref);
    }
  }, [websiteIdParam, listHref, router]);

  useEffect(() => {
    setListOffset(0);
  }, [websiteId, statusFilter]);

  const listParams = useMemo(
    () => ({
      websiteId: websiteId || undefined,
      ...(statusFilter ? { status: statusFilter as KnowledgeSourceStatus } : {}),
      limit: LIST_LIMIT,
      offset: listOffset,
    }),
    [websiteId, statusFilter, listOffset],
  );

  const chatbotList = useAiChatbotSourcesQuery(listParams, {
    enabled: isChatbot && Boolean(websiteId),
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      return items.some((i) => i.status === "processing" || i.status === "pending")
        ? KB_TRAINING_SOURCES_POLL_MS
        : false;
    },
  });
  const assistantList = useAiAssistantKbSourcesQuery(listParams, {
    enabled: !isChatbot && Boolean(websiteId),
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      return items.some((i) => i.status === "processing" || i.status === "pending")
        ? KB_TRAINING_SOURCES_POLL_MS
        : false;
    },
  });
  const sourcesQuery = isChatbot ? chatbotList : assistantList;

  const listItems = sourcesQuery.data?.items ?? [];
  const hasBackgroundTraining = listItems.some(
    (i) => i.status === "processing" || i.status === "pending",
  );
  const listTotal = sourcesQuery.data?.total ?? 0;
  const reindexBusy = reindexChatbot.isPending || reindexAssistant.isPending;

  const processingSources = useMemo(
    () => listItems.filter((i) => i.status === "processing" || i.status === "pending"),
    [listItems],
  );
  const processingWebSources = useMemo(
    () => processingSources.filter((i) => isWebSourceType(i.sourceType)),
    [processingSources],
  );
  const processingNonWebSources = useMemo(
    () => processingSources.filter((i) => !isWebSourceType(i.sourceType)),
    [processingSources],
  );

  const previewSource = useMemo(
    () => listItems.find((item) => item.id === previewSourceId) ?? null,
    [listItems, previewSourceId],
  );

  const siteName =
    hierarchy.selectedWebsite?.name ??
    trainingWebsitesQuery.data?.items.find((i) => i.websiteId === websiteId)?.name ??
    "Website";

  const runBulkReindex = async () => {
    if (!websiteId) return;
    try {
      const body = { websiteId, ...(reindexIncludeFailed ? { includeFailed: true } : {}) };
      const raw = isChatbot
        ? await reindexChatbot.mutateAsync(body)
        : await reindexAssistant.mutateAsync(body);

      if (isReindexBulkResult(raw)) {
        const failed = raw.results.filter((r) => r.status === "failed").length;
        publishAppToast({
          variant: failed > 0 ? "error" : "success",
          message: `Reindexed ${raw.count} item(s)${failed > 0 ? ` — ${failed} failed` : ""}.`,
        });
      } else {
        const toast = toastMessageForCreateResult(raw);
        publishAppToast({ variant: toast.variant, message: toast.message });
      }
      void sourcesQuery.refetch();
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Reindex failed.",
      });
    }
  };

  const handleRowReindex = async (sourceId: string) => {
    setRowBusyId(sourceId);
    try {
      const raw = isChatbot
        ? await reindexChatbot.mutateAsync({ sourceId })
        : await reindexAssistant.mutateAsync({ sourceId });
      const payload = isReindexBulkResult(raw) ? raw.results[0] : raw;
      if (payload) {
        const toast = toastMessageForCreateResult(payload);
        publishAppToast({ variant: toast.variant, message: toast.message });
      }
      void sourcesQuery.refetch();
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Reindex failed.",
      });
    } finally {
      setRowBusyId(null);
    }
  };

  const handleRowDelete = async (sourceId: string) => {
    setRowBusyId(sourceId);
    try {
      if (isChatbot) {
        await deleteChatbot.mutateAsync(sourceId);
      } else {
        await deleteAssistant.mutateAsync(sourceId);
      }
      publishAppToast({ variant: "success", message: "Content item removed." });
      if (previewSourceId === sourceId) setPreviewSourceId(null);
      void sourcesQuery.refetch();
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Delete failed.",
      });
    } finally {
      setRowBusyId(null);
    }
  };

  return (
    <AiTrainingPageShell
      title={siteName}
      subtitle={
        isChatbot
          ? AI_CHATBOT_PRODUCT.description
          : AI_ASSISTANT_PRODUCT.description
      }
      icon={<HeaderIcon sx={{ color: theme.app.dashboard.accentBlue, fontSize: 28 }} />}
      backHref={listHref}
      backLabel={`Back to ${isChatbot ? "chatbot" : "assistant"} list`}
      actions={
        <>
          {websiteId ? (
            <AiTrainingStudioHeaderTabs variant={variant} websiteId={websiteId} active="training" />
          ) : null}
          {isChatbot ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfigModalOpen(true)}
            >
              Chatbot LLM
            </Button>
          ) : null}
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => router.push(aiTrainingAddHref(variant, websiteId))}
          >
            + Add content
          </Button>
        </>
      }
    >
      {(reindexBusy || sourcesQuery.isFetching || hasBackgroundTraining) && websiteId ? (
        <LinearProgress sx={{ borderRadius: 1 }} />
      ) : null}

      {hasBackgroundTraining ? (
        <Stack spacing={1} sx={{ mb: 0.5 }}>
          {processingWebSources.map((source) => (
            <AiTrainingScrapeStatusCard key={source.id} source={source} />
          ))}
          {processingNonWebSources.map((source) => (
            <AiTrainingNonWebProcessingCard key={source.id} source={source} />
          ))}
        </Stack>
      ) : null}

      <Stack spacing={2}>
      {websiteId ? (
        <Box sx={aiTrainingQuickActionsSx}>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => router.push(aiTrainingAddHref(variant, websiteId))}
          >
            + Add content
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(aiTrainingTestStudioHref(variant, websiteId))}
          >
            Test {isChatbot ? "chatbot" : "assistant"}
          </Button>
          {isChatbot ? (
            <Button type="button" variant="secondary" onClick={() => setConfigModalOpen(true)}>
              Chatbot LLM settings
            </Button>
          ) : null}
        </Box>
      ) : null}

      {registeredHost ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Domain: {registeredHost}
          {registeredUrl ? ` · ${registeredUrl}` : ""}
        </Typography>
      ) : null}

      <DashboardCard sx={{ p: 2.5 }}>
        <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
          Training content
        </Typography>
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2, maxWidth: 640 }}>
          Each row is something you added — a sitemap, page, FAQ, or document.{" "}
          <strong>Processing</strong> means we&apos;re still reading it; <strong>Indexed</strong> means the AI can use it.
        </Typography>
        <AiTrainingSourcesTable
          variant={variant}
          websiteId={websiteId}
          items={listItems}
          total={listTotal}
          limit={LIST_LIMIT}
          offset={listOffset}
          isLoading={sourcesQuery.isLoading}
          isFetching={sourcesQuery.isFetching}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onOffsetChange={setListOffset}
          onRefresh={() => void sourcesQuery.refetch()}
          onReindexRow={(id) => void handleRowReindex(id)}
          onDeleteRow={(id) => void handleRowDelete(id)}
          rowBusyId={rowBusyId}
          previewSourceId={previewSourceId}
          onPreviewSource={setPreviewSourceId}
        />

        {previewSource && previewSourceId ? (
          <AiTrainingSourcePreview
            variant={variant}
            sourceId={previewSourceId}
            sourceMeta={previewSource}
            onClose={() => setPreviewSourceId(null)}
          />
        ) : null}
      </DashboardCard>

      <DashboardCard sx={{ p: 2.5 }}>
        <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
          Scrape speed
        </Typography>
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
          Default is one page at a time so you can see exactly what is being scraped. Enable parallel
          only if you want faster total scrape time.
        </Typography>
        <AiTrainingParallelScrapeToggle
          checked={behaviorQuery.data?.parallelScrapePages ?? false}
          disabled={!websiteId || updateBehavior.isPending || behaviorQuery.isLoading}
          onSave={async (enabled) => {
            if (!websiteId) return;
            await updateBehavior.mutateAsync({
              websiteId,
              body: { parallelScrapePages: enabled },
            });
            publishAppToast({
              variant: "success",
              message: enabled
                ? "Parallel scrape on — applies on the next training run."
                : "Parallel scrape off — one page at a time.",
            });
          }}
        />
      </DashboardCard>

      <DashboardCard sx={{ p: 2.5 }}>
        <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
          Refresh all content
        </Typography>
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
          Re-read every item for this website after you change the live site or documents.
        </Typography>
        <Stack spacing={1.5}>
          <FormControlLabel
            control={
              <Checkbox
                checked={reindexIncludeFailed}
                onChange={(e) => setReindexIncludeFailed(e.target.checked)}
                size="small"
                sx={{ color: theme.app.dashboard.textMuted }}
              />
            }
            label={
              <Typography variant="medium" sx={{ color: theme.app.dashboard.white95 }}>
                Include previously failed items
              </Typography>
            }
          />
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={reindexBusy || !websiteId}
            onClick={() => void runBulkReindex()}
          >
            {reindexBusy ? "Refreshing…" : "Refresh all for this website"}
          </Button>
        </Stack>
      </DashboardCard>
      </Stack>

      {websiteId && isChatbot ? (
        <WebsiteAiConfigModal
          open={configModalOpen}
          websiteId={websiteId}
          scope="chatbot"
          canManage={canManageAiConfig}
          onClose={() => setConfigModalOpen(false)}
        />
      ) : null}
    </AiTrainingPageShell>
  );
}
