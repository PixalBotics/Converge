"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import SupportAgentOutlined from "@mui/icons-material/SupportAgentOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { CopilotWebsiteSummary } from "@/api/ai-training/website-setup.api";
import { Button, DashboardCard, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  useCopilotWebsitesQuery,
  useWebsiteAiSetupQuery,
} from "@/lib/hooks/query/ai-training/hooks";
import { extractApiErrorMessageForToast } from "@/lib/notify";
import { AiTrainingCopilotWebsitesTable } from "./AiTrainingCopilotWebsitesTable";
import { AiTrainingPageShell } from "./AiTrainingPageShell";
import { WebsiteAiConfigModal } from "./WebsiteAiConfigModal";
import { usePlatformLlmAccess } from "./hooks/usePlatformLlmAccess";
import { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";
import { buildAiTrainingSessionScope } from "./ai-training-scope.util";
import { useAuth } from "@/lib/auth";
import {
  aiTrainingCopilotHref,
  aiTrainingListHref,
  aiTrainingSetupHref,
} from "./ai-training-routes";
import { aiTrainingOverviewCardSx, aiTrainingStatGridSx, aiTrainingStatCardSx } from "./ai-training-ui.styles";

export function AiTrainingCopilotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme() as AppTheme;
  const websiteId = searchParams.get("websiteId")?.trim() ?? "";
  const hierarchy = useAiTrainingHierarchy();
  const { user } = useAuth();
  const sessionScope = useMemo(() => buildAiTrainingSessionScope(user), [user]);
  const { canManage: canManageAiConfig } = usePlatformLlmAccess();
  const [configOpen, setConfigOpen] = useState(false);
  const [filtersActive, setFiltersActive] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [showAllWebsites, setShowAllWebsites] = useState(false);

  const listParams = useMemo(() => {
    const base = { limit: 200, ...sessionScope };
    if (!filtersActive) return base;
    return {
      ...base,
      resellerId: hierarchy.resellerId.trim() || sessionScope.resellerId,
      parentCompanyId: hierarchy.parentCompanyId.trim() || sessionScope.parentCompanyId,
      childCompanyId: hierarchy.childCompanyId.trim() || undefined,
    };
  }, [
    sessionScope,
    filtersActive,
    hierarchy.resellerId,
    hierarchy.parentCompanyId,
    hierarchy.childCompanyId,
  ]);

  const listQuery = useCopilotWebsitesQuery(listParams);
  const items = listQuery.data?.items ?? [];
  const listError = listQuery.isError
    ? extractApiErrorMessageForToast(listQuery.error) ?? "Could not load copilot websites."
    : null;

  const setupQuery = useWebsiteAiSetupQuery(websiteId, { enabled: Boolean(websiteId) });
  const status = setupQuery.data?.copilotStatus;
  const agents = setupQuery.data?.setup?.agents;

  const selectedRow = useMemo(
    () => items.find((i) => i.websiteId === websiteId) ?? null,
    [items, websiteId],
  );

  useEffect(() => {
    const id = searchParams.get("websiteId")?.trim();
    if (id) hierarchy.setWebsiteId(id);
  }, [searchParams, hierarchy]);

  const stats = useMemo(() => {
    const ready = items.filter((i) => i.copilotStatus.copilotReady);
    const inherited = items.filter((i) => i.copilotStatus.inheritsFromChatbotAndAssistant);
    const dedicated = items.filter((i) => i.copilotStatus.copilotProfileConfigured);
    return {
      total: items.length,
      ready: ready.length,
      inherited: inherited.length,
      dedicated: dedicated.length,
      needsSetup: items.length - ready.length,
    };
  }, [items]);

  const hasActiveTableFilters =
    filtersActive &&
    Boolean(
      hierarchy.resellerId.trim() ||
        hierarchy.parentCompanyId.trim() ||
        hierarchy.childCompanyId.trim(),
    );

  const showCompanyColumns =
    filtersActive || !sessionScope.parentCompanyId || !hierarchy.childCompanyId.trim();

  const selectWebsite = (row: CopilotWebsiteSummary) => {
    hierarchy.setWebsiteId(row.websiteId);
    router.push(aiTrainingCopilotHref(row.websiteId));
  };

  const siteName =
    selectedRow?.name ??
    setupQuery.data?.website.name ??
    hierarchy.selectedWebsite?.name ??
    "website";

  const readyLabel = status?.copilotReady
    ? status.inheritsFromChatbotAndAssistant
      ? "Ready — using Chatbot + Assistant"
      : "Ready — dedicated copilot profile"
    : "Needs setup";

  return (
    <AiTrainingPageShell
      title="AI Copilot"
      subtitle="See which websites have inbox copilot configured. Copilot is separate from AI Assistant training."
      icon={<SupportAgentOutlined sx={{ color: "primary.main", fontSize: 28 }} />}
    >
      <Box sx={aiTrainingOverviewCardSx}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="mediumLarge" color="white" fontWeight={700}>
              Copilot by website
            </Typography>
            <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5, maxWidth: 560 }}>
              When chatbot LLM and assistant knowledge are both set, copilot is ready automatically.
              Otherwise configure a dedicated copilot profile per site.
            </Typography>
          </Box>
        </Box>

        <Box sx={aiTrainingStatGridSx}>
          <StatCard label="Websites" value={stats.total} accent={theme.app.dashboard.accentBlue} />
          <StatCard label="Copilot ready" value={stats.ready} accent={theme.palette.success.light} />
          <StatCard label="Inherited" value={stats.inherited} accent="#a78bfa" />
          <StatCard label="Needs setup" value={stats.needsSetup} accent={theme.palette.warning.light} />
        </Box>

        {listError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {listError}
          </Alert>
        ) : null}

        {listQuery.isFetching && !listQuery.isLoading ? (
          <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />
        ) : null}

        <AiTrainingCopilotWebsitesTable
          items={items}
          isLoading={listQuery.isLoading}
          isFetching={listQuery.isFetching}
          selectedWebsiteId={websiteId}
          onSelectWebsite={selectWebsite}
          onRefresh={() => void listQuery.refetch()}
          showCompanyColumns={showCompanyColumns}
          filterPopoverOpen={filterPopoverOpen}
          onFilterPopoverOpenChange={setFilterPopoverOpen}
          hasActiveTableFilters={hasActiveTableFilters}
          hierarchy={hierarchy}
          showAllWebsites={showAllWebsites}
          onShowAllWebsitesChange={setShowAllWebsites}
          onApplyFilters={() => setFiltersActive(true)}
          onClearFilters={() => {
            setFiltersActive(false);
            setShowAllWebsites(false);
            hierarchy.onResellerChange(hierarchy.sessionResellerId ?? "");
          }}
        />
      </Box>

      {websiteId && setupQuery.isLoading ? (
        <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />
      ) : null}

      {websiteId && !setupQuery.isLoading && status ? (
        <DashboardCard sx={{ p: 2.5, mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            {status.copilotReady ? (
              <CheckCircleOutline color="success" />
            ) : (
              <WarningAmberOutlined color="warning" />
            )}
            <Typography fontWeight={700}>
              {siteName} — {readyLabel}
            </Typography>
          </Box>

          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <StatusRow
              label="AI Chatbot LLM"
              ok={status.chatbotConfigured}
              detail={agents?.chatbot?.profileName ?? selectedRow?.chatbotProfileName}
              actionLabel="Set up chatbot"
              onAction={() => router.push(aiTrainingSetupHref(websiteId, "chatbot"))}
            />
            <StatusRow
              label="AI Assistant knowledge"
              ok={status.assistantConfigured}
              actionLabel="Open assistant training"
              onAction={() => router.push(aiTrainingListHref("assistant"))}
            />
            <StatusRow
              label="Dedicated copilot profile"
              ok={status.copilotProfileConfigured}
              detail={
                status.inheritsFromChatbotAndAssistant
                  ? "Not required — inherited"
                  : agents?.copilot?.profileName ?? selectedRow?.copilotProfileName
              }
              actionLabel="Configure copilot"
              onAction={() => router.push(aiTrainingSetupHref(websiteId, "copilot"))}
              hideAction={status.inheritsFromChatbotAndAssistant}
            />
          </Stack>

          {status.inheritsFromChatbotAndAssistant ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Copilot uses your chatbot LLM and assistant knowledge. No separate copilot setup
              needed.
            </Alert>
          ) : null}

          {!status.copilotReady ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Configure AI Chatbot and AI Assistant first, or set up a dedicated copilot profile.
            </Alert>
          ) : null}

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {!status.copilotReady || status.copilotProfileConfigured ? (
              <Button
                type="button"
                variant="primary"
                sx={gradientPrimaryButtonSx}
                onClick={() => router.push(aiTrainingSetupHref(websiteId, "copilot"))}
                disabled={status.inheritsFromChatbotAndAssistant}
              >
                {status.copilotProfileConfigured ? "Edit copilot setup" : "Set up copilot"}
              </Button>
            ) : null}
            {status.copilotProfileConfigured ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfigOpen(true)}
              >
                LLM profile & usage
              </Button>
            ) : null}
          </Stack>
        </DashboardCard>
      ) : null}

      {websiteId ? (
        <WebsiteAiConfigModal
          open={configOpen}
          websiteId={websiteId}
          scope="copilot"
          canManage={canManageAiConfig}
          onClose={() => setConfigOpen(false)}
          onSaved={() => void listQuery.refetch()}
        />
      ) : null}
    </AiTrainingPageShell>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  const theme = useTheme() as AppTheme;
  return (
    <Box sx={aiTrainingStatCardSx(accent)}>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ color: theme.app.text.primary, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  );
}

function StatusRow({
  label,
  ok,
  detail,
  actionLabel,
  onAction,
  hideAction,
}: {
  label: string;
  ok: boolean;
  detail?: string | null;
  actionLabel: string;
  onAction: () => void;
  hideAction?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        py: 0.5,
      }}
    >
      <Box>
        <Typography variant="body2" fontWeight={600}>
          {label}: {ok ? "Configured" : "Not configured"}
        </Typography>
        {detail ? (
          <Typography variant="caption" color="text.secondary">
            {detail}
          </Typography>
        ) : null}
      </Box>
      {!ok && !hideAction ? (
        <Button type="button" variant="secondary" size="small" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
}
