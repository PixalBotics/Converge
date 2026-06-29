"use client";

import Box from "@mui/material/Box";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { integrationsMainCardSx } from "@/app/dashboard/integrations/integrations.styles";
import { Button, DashboardCard, Typography } from "@/components/common";
import type {
  AiUsageByProvider,
  PlatformLlmProfileDetail,
  PlatformLlmProvider,
} from "@/api/ai-training/platform-llm.api";
import { formatTokenCount } from "./ai-config.utils";
import { LLM_PROVIDER_META, type LlmProviderCode } from "./platform-llm-provider.meta";

export function PlatformLlmProviderCard({
  provider,
  profiles,
  usage,
  canManage,
  onConfigure,
}: {
  provider: PlatformLlmProvider;
  profiles: PlatformLlmProfileDetail[];
  usage: AiUsageByProvider | null;
  canManage: boolean;
  onConfigure: () => void;
}) {
  const theme = useTheme() as AppTheme;
  const meta = LLM_PROVIDER_META[provider.code as LlmProviderCode];
  const providerProfiles = profiles.filter(
    (p) => p.generationProvider.code === provider.code,
  );

  return (
    <DashboardCard sx={{ ...integrationsMainCardSx, mb: 0, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            {meta.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
            {meta.description}
          </Typography>
        </Box>
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            flexShrink: 0,
            bgcolor: provider.keyConfigured
              ? `${theme.palette.success.main}22`
              : "rgba(255,255,255,0.08)",
            color: provider.keyConfigured
              ? theme.palette.success.main
              : theme.app.dashboard.textMuted,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {provider.keyConfigured ? "Configured" : "Not configured"}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <Stat label="Profiles" value={String(providerProfiles.length)} />
        <Stat
          label="Tokens used"
          value={usage ? formatTokenCount(usage.totalTokens) : "0"}
        />
        <Stat label="Requests" value={usage ? String(usage.requestCount) : "0"} />
        <Stat
          label="Per-request max"
          value={
            providerProfiles[0]
              ? `${providerProfiles[0].maxOutputTokens} tok`
              : "—"
          }
        />
      </Box>

      {providerProfiles.length > 0 ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
            Model versions
          </Typography>
          {providerProfiles.map((p) => (
            <Typography key={p.id} variant="caption" display="block" color="text.secondary">
              {p.name} — {p.generationModel}
            </Typography>
          ))}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
          No active profiles for this provider until a key is saved.
        </Typography>
      )}

      {canManage ? (
        <Button
          type="button"
          variant={provider.keyConfigured ? "secondary" : "primary"}
          size="small"
          startIcon={<SettingsOutlined sx={{ fontSize: 18 }} />}
          onClick={onConfigure}
        >
          {provider.keyConfigured ? "Edit configuration" : "Configure"}
        </Button>
      ) : null}
    </DashboardCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {value}
      </Typography>
    </Box>
  );
}
