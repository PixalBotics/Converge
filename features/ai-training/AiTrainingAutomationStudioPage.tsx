"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AutoStories from "@mui/icons-material/AutoStories";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  useAiAssistantKbSourcesQuery,
  useAiAssistantKbTrainingWebsitesQuery,
  useAiChatbotSourcesQuery,
  useAiChatbotTrainingWebsitesQuery,
} from "@/lib/hooks/query/ai-knowledge";
import { useAiTrainingTestContextQuery } from "@/lib/hooks/query/ai-training/hooks";
import { useAuth } from "@/lib/auth";
import { AiTrainingFlowBuilderCanvas } from "./AiTrainingFlowBuilderCanvas";
import { AiTrainingSimpleSetupPanel } from "./AiTrainingSimpleSetupPanel";
import { AiTrainingStudioSettingsRail } from "./AiTrainingStudioSettingsRail";
import { AiTrainingStudioViewToggle } from "./AiTrainingStudioViewToggle";
import {
  AiTrainingDummyChatWidget,
  type TestChatTurn,
} from "./AiTrainingDummyChatWidget";
import { formatTestReplyHint } from "./ai-training-test-reply-hint.util";
import { AiTrainingFloatingTestChat } from "./AiTrainingFloatingTestChat";
import { aiTrainingTestStudioHref } from "./ai-training-routes";
import { AiTrainingStudioHeaderTabs } from "./AiTrainingStudioHeaderTabs";
import { AiTrainingScrapeLiveBar } from "./AiTrainingScrapeLiveBar";
import { hostFromWebsiteUrl, isBasicTrainingReady, type AiTrainingKbVariant } from "./ai-training-kb.utils";
import { buildAiTrainingSessionScope } from "./ai-training-scope.util";
import type { AiPipelineStep, FlowExecutionStep } from "@/api/ai-training/ai-training.api";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useAiTrainingTestRespondMutation } from "@/lib/hooks/query/ai-training/hooks";
import { aiTrainingStudioPageWrapper } from "./ai-training-studio.styles";
import { studioColors } from "./ai-training-studio.tokens";

const VARIANT_COPY: Record<AiTrainingKbVariant, { subtitle: string }> = {
  chatbot: {
    subtitle: "Flow overview · quick setup · test chat",
  },
  assistant: {
    subtitle: "Flow overview · quick setup · test",
  },
};


export function AiTrainingAutomationStudioPage({

  variant,

}: {

  variant: AiTrainingKbVariant;

}) {

  const theme = useTheme() as AppTheme;
  const c = studioColors(theme);

  const router = useRouter();

  const searchParams = useSearchParams();

  const websiteId = searchParams.get("websiteId")?.trim() ?? "";

  const { user } = useAuth();

  const sessionScope = useMemo(() => buildAiTrainingSessionScope(user), [user]);

  const copy = VARIANT_COPY[variant];

  const isChatbot = variant === "chatbot";



  const chatbotSites = useAiChatbotTrainingWebsitesQuery(

    { limit: 500, trainedOnly: false, ...sessionScope },

    { enabled: isChatbot },

  );

  const assistantSites = useAiAssistantKbTrainingWebsitesQuery(

    { limit: 500, trainedOnly: false, ...sessionScope },

    { enabled: !isChatbot },

  );

  const sitesQuery = isChatbot ? chatbotSites : assistantSites;



  const chatbotSources = useAiChatbotSourcesQuery(
    { websiteId, limit: 50, offset: 0 },
    {
      enabled: isChatbot && Boolean(websiteId),
      refetchInterval: (query) => {
        const items = query.state.data?.items ?? [];
        return items.some((i) => i.status === "processing" || i.status === "pending")
          ? 4_000
          : false;
      },
    },
  );

  const assistantSources = useAiAssistantKbSourcesQuery(
    { websiteId, limit: 50, offset: 0 },
    {
      enabled: !isChatbot && Boolean(websiteId),
      refetchInterval: (query) => {
        const items = query.state.data?.items ?? [];
        return items.some((i) => i.status === "processing" || i.status === "pending")
          ? 4_000
          : false;
      },
    },
  );

  const sourcesQuery = isChatbot ? chatbotSources : assistantSources;



  const testContext = useAiTrainingTestContextQuery(websiteId, {

    enabled: Boolean(websiteId),

  });

  const testMutation = useAiTrainingTestRespondMutation();



  const [input, setInput] = useState("");

  const [turns, setTurns] = useState<TestChatTurn[]>([]);

  const [pipeline, setPipeline] = useState<AiPipelineStep[]>([]);

  const [activeFlowNodeIds, setActiveFlowNodeIds] = useState<string[]>([]);

  const [activeFlowEdgeIds, setActiveFlowEdgeIds] = useState<string[]>([]);
  const [flowExecution, setFlowExecution] = useState<FlowExecutionStep[]>([]);
  const [flowExecutionErrors, setFlowExecutionErrors] = useState<string[]>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [studioView, setStudioView] = useState<"simple" | "advanced">("advanced");



  const siteRow = useMemo(

    () => sitesQuery.data?.items.find((i) => i.websiteId === websiteId),

    [sitesQuery.data?.items, websiteId],

  );



  const websiteName =

    testContext.data?.websiteName?.trim() ||

    siteRow?.name?.trim() ||

    "Website";

  const websiteUrl = testContext.data?.websiteUrl || siteRow?.url || "";

  const websiteHost = hostFromWebsiteUrl(websiteUrl);

  const indexedCount = siteRow?.indexedSourceCount ?? sourcesQuery.data?.total ?? 0;
  const liveSources = sourcesQuery.data?.items ?? [];
  const scrapingSource = liveSources.find(
    (s) => s.status === "processing" && s.scrapeProgress,
  );
  const partialChunksReady = liveSources.some(
    (s) =>
      s.status === "processing" &&
      ((s.chunkCount ?? 0) > 0 ||
        isBasicTrainingReady(s.scrapeProgress, s.trainingTier)),
  );

  const botLabel = isChatbot ? websiteName : `${websiteName} copilot`;



  useEffect(() => {

    if (!websiteId && sitesQuery.data?.items?.[0]) {

      router.replace(aiTrainingTestStudioHref(variant, sitesQuery.data.items[0].websiteId));

    }

  }, [websiteId, sitesQuery.data?.items, variant, router]);



  const sendMessage = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || testMutation.isPending || !websiteId) return;

    const history = turns.map((t) =>
      t.role === "visitor" ? `visitor: ${t.text}` : `ai: ${t.text}`,
    );

    setTurns((prev) => [...prev, { id: `v-${Date.now()}`, role: "visitor", text: trimmed }]);

    try {
      const result = await testMutation.mutateAsync({
        websiteId,
        variant,
        message: trimmed,
        ...(websiteUrl ? { currentPageUrl: websiteUrl } : {}),
        ...(history.length > 0 ? { history } : {}),
      });

      let answer = "";
      let steps: AiPipelineStep[] = result.pipeline ?? [];

      answer = result.response?.trim() || "";
      if (result.knowledgeMatches?.length) {
        const sources = result.knowledgeMatches
          .slice(0, 3)
          .map((m) => m.sourceRef || "KB chunk")
          .join(", ");
        steps = [
          ...steps.filter((s) => s.id !== "kb_search"),
          ...(steps.some((s) => s.id === "kb_search")
            ? []
            : [
                {
                  id: "kb_search",
                  label: "KB search",
                  detail: `${result.knowledgeMatches.length} match(es): ${sources}`,
                  status: "done" as const,
                },
              ]),
        ];
      }

      setPipeline(steps);
      setActiveFlowNodeIds(result.activeFlowNodeIds ?? []);
      setActiveFlowEdgeIds(result.activeFlowEdgeIds ?? []);
      setFlowExecution(result.flowExecution ?? []);
      setFlowExecutionErrors(result.flowExecutionErrors ?? []);
      setTurns((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          text: answer || "(No reply text)",
          replyHint: formatTestReplyHint(result, { partialTraining: partialChunksReady }),
        },
      ]);
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Test request failed.",
      });
    }
  };



  const topBar = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minWidth: 0,
        flex: 1,
        flexWrap: { xs: "wrap", lg: "nowrap" },
      }}
    >
      <AiTrainingStudioHeaderTabs variant={variant} websiteId={websiteId} active="test" />
      <Box sx={{ minWidth: 0, flex: 1, display: { xs: "none", md: "block" } }}>
        <Typography
          variant="caption"
          sx={{
            color: theme.app.dashboard.textMuted,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {websiteHost || websiteName} · {copy.subtitle}
        </Typography>
      </Box>
      <Chip
        size="small"
        icon={
          isChatbot ? (
            <SmartToyOutlined sx={{ fontSize: 14 }} />
          ) : (
            <AutoStories sx={{ fontSize: 14 }} />
          )
        }
        label={
          scrapingSource?.scrapeProgress
            ? `${scrapingSource.scrapeProgress.chunksIndexed} pieces · training…`
            : `${indexedCount} indexed`
        }
        sx={{
          bgcolor: c.surfaceMuted,
          color: c.text,
          fontWeight: 600,
          border: `1px solid ${c.border}`,
          flexShrink: 0,
          ml: { lg: "auto" },
        }}
      />
    </Box>
  );



  if (!websiteId) {

    return (

      <Box sx={aiTrainingStudioPageWrapper}>

        <Alert severity="info">Loading websites…</Alert>

      </Box>

    );

  }



  const testChat = (
    <AiTrainingFloatingTestChat
      siteHint={websiteHost || "indexed training"}
      turnCount={turns.length}
      defaultOpen={false}
      anchor={studioView === "advanced" ? "right" : "left"}
    >
      <AiTrainingDummyChatWidget
        compact
        turns={turns}
        input={input}
        onInputChange={setInput}
        onSend={() => {
          const msg = input.trim();
          if (!msg) return;
          setInput("");
          void sendMessage(msg);
        }}
        sending={testMutation.isPending}
        botLabel={botLabel}
        siteHint={websiteHost || "indexed training"}
      />
    </AiTrainingFloatingTestChat>
  );

  return (
    <Box sx={aiTrainingStudioPageWrapper}>
      <AiTrainingFlowBuilderCanvas
        websiteId={websiteId}
        variant={variant}
        pipelineSteps={pipeline}
        activeFlowNodeIds={activeFlowNodeIds}
        activeFlowEdgeIds={activeFlowEdgeIds}
        isRunning={testMutation.isPending}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        studioView={studioView}
        scrapeBar={
          scrapingSource?.scrapeProgress ? (
            <AiTrainingScrapeLiveBar
              progress={scrapingSource.scrapeProgress}
              trainingTier={
                scrapingSource.trainingTier ?? scrapingSource.scrapeProgress.trainingTier
              }
            />
          ) : null
        }
        viewToggle={
          <AiTrainingStudioViewToggle value={studioView} onChange={setStudioView} />
        }
        simpleContent={
          <AiTrainingSimpleSetupPanel
            websiteId={websiteId}
            variant={variant}
            indexedCount={indexedCount}
            chatMode={testContext.data?.chatMode ?? "HYBRID"}
            onQuickTest={(msg) => void sendMessage(msg)}
          />
        }
        flowExecution={flowExecution}
        flowExecutionErrors={flowExecutionErrors}
        topBar={topBar}
        settingsPanel={<AiTrainingStudioSettingsRail websiteId={websiteId} />}
        testChat={testChat}
      />
    </Box>
  );

}

