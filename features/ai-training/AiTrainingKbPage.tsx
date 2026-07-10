"use client";

import { useMemo, useState } from "react";
import AutoStories from "@mui/icons-material/AutoStories";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import type { AppTheme } from "@/theme/theme";
import {
  useAiAssistantKbTrainingWebsitesQuery,
  useAiChatbotTrainingWebsitesQuery,
} from "@/lib/hooks/query/ai-knowledge";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { AiTrainingHowItWorks } from "./AiTrainingHowItWorks";
import { AiTrainingPageShell } from "./AiTrainingPageShell";
import { AiTrainingWebsitesOverview } from "./AiTrainingWebsitesOverview";
import { AI_ASSISTANT_PRODUCT, AI_CHATBOT_PRODUCT } from "@/lib/ai/ai-role-copy";
import { aiTrainingAddHref, aiTrainingManageHref, aiTrainingSetupHref, aiTrainingTestStudioHref } from "./ai-training-routes";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";
import { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";
import { buildAiTrainingSessionScope } from "./ai-training-scope.util";
import { useAuth } from "@/lib/auth";

const VARIANT_COPY: Record<
  AiTrainingKbVariant,
  { title: string; subtitle: string }
> = {
  assistant: {
    title: AI_ASSISTANT_PRODUCT.title,
    subtitle: AI_ASSISTANT_PRODUCT.description,
  },
  chatbot: {
    title: AI_CHATBOT_PRODUCT.title,
    subtitle: AI_CHATBOT_PRODUCT.description,
  },
};

export function AiTrainingKbPage({ variant }: { variant: AiTrainingKbVariant }) {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
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
      icon={<HeaderIcon sx={{ color: theme.app.dashboard.accentBlue, fontSize: 28 }} />}
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
              : aiTrainingAddHref("assistant"),
          )
        }
      />
    </AiTrainingPageShell>
  );
}
