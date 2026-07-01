"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { FormModal, InputField, Typography } from "@/components/common";
import type {
  AiUsageByProvider,
  PlatformLlmProfileDetail,
  PlatformLlmProvider,
} from "@/api/ai-training/platform-llm.api";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useUpsertPlatformLlmKeyMutation } from "@/lib/hooks/query/ai-training/platform-llm-hooks";
import { formatTokenCount } from "./ai-config.utils";
import { LLM_PROVIDER_META, type LlmProviderCode } from "./platform-llm-provider.meta";

export function PlatformLlmProviderConfigModal({
  open,
  provider,
  profiles,
  usage,
  canManage,
  onClose,
  onSaved,
}: {
  open: boolean;
  provider: PlatformLlmProvider | null;
  profiles: PlatformLlmProfileDetail[];
  usage: AiUsageByProvider | null;
  canManage: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const code = provider?.code;
  const meta = code ? LLM_PROVIDER_META[code] : null;

  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(meta?.defaultBaseUrl ?? "");
  const mutation = useUpsertPlatformLlmKeyMutation();

  useEffect(() => {
    if (!open || !code) return;
    setApiKey("");
    setBaseUrl(LLM_PROVIDER_META[code].defaultBaseUrl ?? "");
  }, [open, code]);

  const providerProfiles = useMemo(
    () => profiles.filter((p) => p.generationProvider.code === code),
    [profiles, code],
  );

  const handleSave = async () => {
    if (!provider || !canManage || !code) return;
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      publishAppToast({ variant: "error", message: "API key is required." });
      return;
    }
    try {
      await mutation.mutateAsync({
        providerCode: code,
        apiKey: trimmedKey,
        ...(meta?.supportsBaseUrl
          ? {
              baseUrl:
                baseUrl.trim() || meta.defaultBaseUrl || undefined,
            }
          : {}),
      });
      publishAppToast({
        variant: "success",
        message: `${meta?.name ?? code} configuration saved.`,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Could not save configuration.",
      });
    }
  };

  if (!provider || !meta) return null;

  return (
    <FormModal
      open={open}
      title={`${meta.name} configuration`}
      description={meta.description}
      onClose={onClose}
      onSave={() => {
        if (canManage) void handleSave();
      }}
      primaryButtonLabel={mutation.isPending ? "Saving…" : "Save configuration"}
      primaryButtonDisabled={mutation.isPending || !canManage || !apiKey.trim()}
      maxWidth={560}
      fitContent
      showCancelButton
      cancelButtonLabel="Close"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={provider.keyConfigured ? "Configured" : "Not configured"}
            size="small"
            color={provider.keyConfigured ? "success" : "default"}
            variant="outlined"
          />
          {provider.lastTestStatus ? (
            <Chip
              label={`Last test: ${provider.lastTestStatus}`}
              size="small"
              variant="outlined"
            />
          ) : null}
        </Box>

        {usage ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
              {meta.shortName} token usage
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <UsageStat label="Total" value={formatTokenCount(usage.totalTokens)} />
              <UsageStat label="Prompt" value={formatTokenCount(usage.promptTokens)} />
              <UsageStat
                label="Completion"
                value={formatTokenCount(usage.completionTokens)}
              />
              <UsageStat label="Requests" value={String(usage.requestCount)} />
            </Box>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            No usage recorded for this provider yet.
          </Typography>
        )}

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <Typography variant="body2" fontWeight={700}>
          API credentials
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {meta.docsHint}. Stored keys are encrypted and never shown again.
        </Typography>

        {provider.keyConfigured ? (
          <Typography variant="caption" color="text.secondary">
            A key is already saved. Enter a new value only to replace it.
          </Typography>
        ) : null}

        <InputField
          label={`${meta.name} API key`}
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste API key"
          disabled={!canManage}
          autoComplete="off"
        />

        {meta.supportsBaseUrl ? (
          <InputField
            label="Base URL"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={meta.defaultBaseUrl}
            disabled={!canManage}
          />
        ) : null}

        {providerProfiles.length > 0 ? (
          <>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
            <Typography variant="body2" fontWeight={700}>
              Profiles using {meta.shortName}
            </Typography>
            {providerProfiles.map((profile) => (
              <Box
                key={profile.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {profile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Model: {profile.generationModel}
                  {profile.embeddingModel ? ` · embed: ${profile.embeddingModel}` : ""}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Max {profile.maxOutputTokens} tokens/request · temp {profile.temperature}
                  {profile.usage
                    ? ` · ${formatTokenCount(profile.usage.totalTokens)} used`
                    : ""}
                </Typography>
              </Box>
            ))}
          </>
        ) : null}
      </Box>
    </FormModal>
  );
}

function UsageStat({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 72 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}
