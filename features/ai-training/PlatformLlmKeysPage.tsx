"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import KeyOutlined from "@mui/icons-material/KeyOutlined";
import { integrationsMainCardSx } from "@/app/dashboard/integrations/integrations.styles";
import {
  Button,
  DashboardCard,
  DataTable,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import type {
  PlatformLlmProfileDetail,
  PlatformLlmProvider,
} from "@/api/ai-training/platform-llm.api";
import { AiTrainingPageShell } from "./AiTrainingPageShell";
import { PlatformLlmProviderCard } from "./PlatformLlmProviderCard";
import { PlatformLlmProviderConfigModal } from "./PlatformLlmProviderConfigModal";
import { usePlatformLlmAccess } from "./hooks/usePlatformLlmAccess";
import {
  usePlatformAiOverviewQuery,
  usePlatformLlmProvidersQuery,
} from "@/lib/hooks/query/ai-training/platform-llm-hooks";
import { aiTrainingListHref, aiTrainingSetupHref } from "./ai-training-routes";
import { formatTokenCount } from "./ai-config.utils";
import { LLM_PROVIDER_ORDER } from "./platform-llm-provider.meta";

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 120 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {value}
      </Typography>
    </Box>
  );
}

export function PlatformLlmKeysPage() {
  const router = useRouter();
  const { canView, canManage } = usePlatformLlmAccess();
  const overviewQuery = usePlatformAiOverviewQuery({ enabled: canView });
  const providersQuery = usePlatformLlmProvidersQuery({ enabled: canView });

  const [activeProvider, setActiveProvider] = useState<PlatformLlmProvider | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openProviderModal = useCallback((provider: PlatformLlmProvider) => {
    setActiveProvider(provider);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setActiveProvider(null);
  }, []);

  const overview = overviewQuery.data;
  const profiles = overview?.profiles ?? [];
  const usage = overview?.usage;

  const providersByCode = useMemo(() => {
    const map = new Map<string, PlatformLlmProvider>();
    for (const p of providersQuery.data ?? []) {
      map.set(p.code, p);
    }
    return map;
  }, [providersQuery.data]);

  const orderedProviders = useMemo(
    () =>
      LLM_PROVIDER_ORDER.map((code) => providersByCode.get(code)).filter(
        (p): p is PlatformLlmProvider => Boolean(p),
      ),
    [providersByCode],
  );

  const usageByCode = useMemo(() => {
    const map = new Map<string, NonNullable<typeof usage>["byProvider"][number]>();
    for (const row of usage?.byProvider ?? []) {
      if (row.providerCode) map.set(row.providerCode, row);
    }
    return map;
  }, [usage?.byProvider]);

  const profileColumns = useMemo<DataTableColumn<PlatformLlmProfileDetail>[]>(
    () => [
      {
        id: "provider",
        label: "Provider",
        render: (_v, row) => (
          <Typography variant="body2" fontWeight={600}>
            {row.generationProvider.name}
          </Typography>
        ),
      },
      {
        id: "name",
        label: "Profile",
        render: (_v, row) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.name}
            </Typography>
            {row.description ? (
              <Typography variant="caption" color="text.secondary" display="block">
                {row.description}
              </Typography>
            ) : null}
          </Box>
        ),
      },
      {
        id: "generation",
        label: "Model version",
        render: (_v, row) => (
          <Typography variant="body2">{row.generationModel}</Typography>
        ),
      },
      {
        id: "embedding",
        label: "Embedding",
        render: (_v, row) => (
          <Typography variant="body2" color="text.secondary">
            {row.embeddingModel
              ? `${row.embeddingProvider?.name ?? ""} ${row.embeddingModel}`.trim()
              : "—"}
          </Typography>
        ),
      },
      {
        id: "limits",
        label: "Per request",
        render: (_v, row) => (
          <Typography variant="body2" color="text.secondary">
            max {row.maxOutputTokens} · temp {row.temperature}
          </Typography>
        ),
      },
      {
        id: "usage",
        label: "Tokens used",
        render: (_v, row) => (
          <Typography variant="body2" fontWeight={600}>
            {row.usage
              ? `${formatTokenCount(row.usage.totalTokens)} (${row.usage.requestCount} req)`
              : "0"}
          </Typography>
        ),
      },
    ],
    [],
  );

  if (!canView) {
    return null;
  }

  const configuredCount = overview?.configuredProviders.length ?? 0;

  return (
    <AiTrainingPageShell
      title="AI platform configuration"
      subtitle="Each LLM provider is configured independently — Gemini, OpenAI, and Groq each have their own credentials and usage."
      icon={<KeyOutlined sx={{ fontSize: 28, color: "primary.main" }} />}
      backHref={aiTrainingListHref("assistant")}
      backLabel="Back to AI Management"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <DashboardCard sx={integrationsMainCardSx}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <SummaryStat label="Configured providers" value={`${configuredCount} / 3`} />
              <SummaryStat label="Active profiles" value={String(profiles.length)} />
              <SummaryStat
                label="Total tokens used"
                value={formatTokenCount(usage?.totals.totalTokens ?? 0)}
              />
              <SummaryStat
                label="LLM requests"
                value={String(usage?.totals.requestCount ?? 0)}
              />
            </Box>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => {
                void overviewQuery.refetch();
                void providersQuery.refetch();
              }}
              disabled={overviewQuery.isFetching || providersQuery.isFetching}
            >
              Refresh
            </Button>
          </Box>
        </DashboardCard>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          {orderedProviders.map((provider) => (
            <PlatformLlmProviderCard
              key={provider.id}
              provider={provider}
              profiles={profiles}
              usage={usageByCode.get(provider.code) ?? null}
              canManage={canManage}
              onConfigure={() => openProviderModal(provider)}
            />
          ))}
        </Box>

        <DashboardCard sx={integrationsMainCardSx}>
          <Typography variant="regularLarge" fontWeight={700} sx={{ mb: 2 }}>
            Model profiles
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Profiles appear only for providers with saved keys. Assigned per website in
            the AI setup wizard.
          </Typography>

          <DataTable<PlatformLlmProfileDetail>
            columns={profileColumns}
            rows={profiles}
            getRowId={(row) => row.id}
            isLoading={overviewQuery.isLoading}
            minWidth={960}
            emptyState={{
              title: "No profiles available",
              description: "Configure at least one provider above to enable model profiles.",
            }}
          />

          <Box sx={{ mt: 2 }}>
            <Button
              type="button"
              variant="primary"
              size="small"
              onClick={() => router.push(aiTrainingSetupHref())}
            >
              Set up website AI
            </Button>
          </Box>
        </DashboardCard>
      </Box>

      <PlatformLlmProviderConfigModal
        open={modalOpen}
        provider={activeProvider}
        profiles={profiles}
        usage={
          activeProvider ? usageByCode.get(activeProvider.code) ?? null : null
        }
        canManage={canManage}
        onClose={closeModal}
        onSaved={() => {
          void overviewQuery.refetch();
          void providersQuery.refetch();
        }}
      />
    </AiTrainingPageShell>
  );
}
