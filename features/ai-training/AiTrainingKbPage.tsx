"use client";

import { useMemo, useState } from "react";
import AutoStories from "@mui/icons-material/AutoStories";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import { useRouter } from "next/navigation";
import {
  useAiAssistantKbTrainingWebsitesQuery,
  useAiChatbotTrainingWebsitesQuery,
} from "@/lib/hooks/query/ai-knowledge";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { AiTrainingHowItWorks } from "./AiTrainingHowItWorks";
import { AiTrainingPageShell } from "./AiTrainingPageShell";
import { AiTrainingWebsitesOverview } from "./AiTrainingWebsitesOverview";
import { aiTrainingListHref, aiTrainingManageHref, aiTrainingSetupHref, aiTrainingTestStudioHref } from "./ai-training-routes";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";
import { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";
import { buildAiTrainingSessionScope } from "./ai-training-scope.util";
import { useAuth } from "@/lib/auth";

const VARIANT_COPY: Record<
  AiTrainingKbVariant,
  { title: string; subtitle: string }
> = {
  assistant: {
    title: "AI Assistant training",
    subtitle:
      "Websites with internal assistant knowledge — site scrape, docs, and FAQs (separate from visitor chatbot and inbox copilot).",
  },
  chatbot: {
    title: "AI Chatbot training",
    subtitle: "Websites trained for the visitor widget — sitemap, pages, and FAQs.",
  },
};

export function AiTrainingKbPage({ variant }: { variant: AiTrainingKbVariant }) {
  const router = useRouter();
  const copy = VARIANT_COPY[variant];
  const HeaderIcon = variant === "chatbot" ? SmartToyOutlined : AutoStories;
  const isChatbot = variant === "chatbot";

  const hierarchy = useAiTrainingHierarchy();
  const { user } = useAuth();
  const sessionScope = useMemo(() => buildAiTrainingSessionScope(user), [user]);
  const [showAllWebsites, setShowAllWebsites] = useState(false);
  const [filtersActive, setFiltersActive] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const trainingWebsitesParams = useMemo(() => {
    const base = { limit: 200, trainedOnly: true as boolean, ...sessionScope };
    if (!filtersActive) return base;
    return {
      ...base,
      resellerId: hierarchy.resellerId.trim() || sessionScope.resellerId,
      parentCompanyId:
        hierarchy.parentCompanyId.trim() || sessionScope.parentCompanyId,
      childCompanyId: hierarchy.childCompanyId.trim() || undefined,
      trainedOnly: hierarchy.childCompanyId.trim() ? !showAllWebsites : true,
    };
  }, [
    sessionScope,
    filtersActive,
    hierarchy.resellerId,
    hierarchy.parentCompanyId,
    hierarchy.childCompanyId,
    showAllWebsites,
  ]);

  const chatbotTrainingWebsites = useAiChatbotTrainingWebsitesQuery(trainingWebsitesParams, {
    enabled: isChatbot,
  });
  const assistantTrainingWebsites = useAiAssistantKbTrainingWebsitesQuery(trainingWebsitesParams, {
    enabled: !isChatbot,
  });
  const trainingWebsitesQuery = isChatbot ? chatbotTrainingWebsites : assistantTrainingWebsites;
  const trainingWebsiteItems = trainingWebsitesQuery.data?.items ?? [];
  const trainingWebsitesError = trainingWebsitesQuery.isError
    ? extractApiErrorMessageForToast(trainingWebsitesQuery.error) ??
      "Could not load website training summary."
    : null;

  const hasActiveTableFilters =
    filtersActive &&
    Boolean(
      hierarchy.resellerId.trim() ||
        hierarchy.parentCompanyId.trim() ||
        hierarchy.childCompanyId.trim(),
    );

  const clearFilters = () => {
    setFiltersActive(false);
    setShowAllWebsites(false);
    hierarchy.onResellerChange(hierarchy.sessionResellerId ?? "");
  };

  return (
    <AiTrainingPageShell
      title={copy.title}
      subtitle={copy.subtitle}
      icon={<HeaderIcon sx={{ color: "primary.main", fontSize: 28 }} />}
    >
      <AiTrainingHowItWorks variant={variant} />

      <AiTrainingWebsitesOverview
        variant={variant}
        items={trainingWebsiteItems}
        isLoading={trainingWebsitesQuery.isLoading}
        isFetching={trainingWebsitesQuery.isFetching}
        isError={trainingWebsitesQuery.isError}
        errorMessage={trainingWebsitesError}
        showCompanyColumns={
          filtersActive ||
          !sessionScope.parentCompanyId ||
          !hierarchy.childCompanyId.trim()
        }
        filtersActive={filtersActive}
        hasActiveTableFilters={hasActiveTableFilters}
        filterPopoverOpen={filterPopoverOpen}
        onFilterPopoverOpenChange={setFilterPopoverOpen}
        hierarchy={hierarchy}
        showAllWebsites={showAllWebsites}
        onShowAllWebsitesChange={setShowAllWebsites}
        onApplyFilters={() => setFiltersActive(true)}
        onClearFilters={clearFilters}
        onRefresh={() => void trainingWebsitesQuery.refetch()}
        onSelectWebsite={(row) => router.push(aiTrainingManageHref(variant, row.websiteId))}
        onTestWebsite={(row) =>
          router.push(aiTrainingTestStudioHref(variant, row.websiteId))
        }
        onAddTraining={() =>
          router.push(
            isChatbot
              ? aiTrainingSetupHref(undefined, "chatbot")
              : aiTrainingListHref("assistant"),
          )
        }
      />
    </AiTrainingPageShell>
  );
}
