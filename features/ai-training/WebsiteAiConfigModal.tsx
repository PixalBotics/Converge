"use client";

import { useEffect, useMemo, useState } from "react";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import SupportAgentOutlined from "@mui/icons-material/SupportAgentOutlined";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { FormModal, SelectField, Typography } from "@/components/common";
import type { WebsiteAiAgentConfig } from "@/api/ai-training/website-setup.api";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  useUpdateWebsiteAiModelsMutation,
  useWebsiteAiSetupQuery,
} from "@/lib/hooks/query/ai-training/website-setup-hooks";
import { formatTokenCount } from "./ai-config.utils";

const TONE_OPTIONS = [
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "FRIENDLY", label: "Friendly" },
  { value: "SALES", label: "Sales-focused" },
];

function AgentDetailPanel({
  title,
  icon,
  agent,
  profileOptions,
  profileId,
  onProfileChange,
  canManage,
}: {
  title: string;
  icon: React.ReactNode;
  agent: WebsiteAiAgentConfig | null;
  profileOptions: { value: string; label: string }[];
  profileId: string;
  onProfileChange: (value: string) => void;
  canManage: boolean;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: "1px solid rgba(255,255,255,0.1)",
        flex: 1,
        minWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        {icon}
        <Typography variant="body2" fontWeight={700}>
          {title}
        </Typography>
      </Stack>

      <SelectField
        label="LLM profile"
        value={profileId}
        onChange={onProfileChange}
        options={profileOptions}
        disabled={!canManage}
      />

      {agent ? (
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.75 }}>
          <DetailRow label="Provider" value={`${agent.providerName} (${agent.providerCode})`} />
          <DetailRow label="Generation model" value={agent.generationModel} />
          <DetailRow
            label="Embedding model"
            value={
              agent.embeddingModel
                ? `${agent.embeddingProviderName ?? ""} · ${agent.embeddingModel}`.trim()
                : "—"
            }
          />
          <DetailRow
            label="Per-request limit"
            value={`${agent.maxOutputTokens} tokens · temp ${agent.temperature}`}
          />
          <DetailRow
            label="Tokens used (this website)"
            value={
              agent.usage
                ? `${formatTokenCount(agent.usage.totalTokens)} total (${formatTokenCount(agent.usage.promptTokens)} prompt + ${formatTokenCount(agent.usage.completionTokens)} completion)`
                : "No usage recorded yet"
            }
          />
          <DetailRow
            label="LLM requests"
            value={agent.usage ? String(agent.usage.requestCount) : "0"}
          />
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
          Not configured yet — pick a profile above.
        </Typography>
      )}
    </Box>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
}

export function WebsiteAiConfigModal({
  open,
  websiteId,
  scope = "chatbot",
  canManage,
  onClose,
  onSaved,
}: {
  open: boolean;
  websiteId: string;
  scope?: "chatbot" | "copilot";
  canManage: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const setupQuery = useWebsiteAiSetupQuery(websiteId, {
    enabled: open && Boolean(websiteId),
  });
  const updateMutation = useUpdateWebsiteAiModelsMutation();

  const [chatbotProfileId, setChatbotProfileId] = useState("");
  const [copilotProfileId, setCopilotProfileId] = useState("");
  const [tone, setTone] = useState<"PROFESSIONAL" | "FRIENDLY" | "SALES">("PROFESSIONAL");

  const data = setupQuery.data;

  useEffect(() => {
    if (!open || !data) return;
    if (data.setup?.chatbotProfileId) setChatbotProfileId(data.setup.chatbotProfileId);
    if (data.setup?.copilotProfileId) setCopilotProfileId(data.setup.copilotProfileId);
    if (data.setup?.tone) setTone(data.setup.tone);
  }, [open, data]);

  const profileOptions = useMemo(
    () =>
      (data?.profiles ?? []).map((p) => ({
        value: p.id,
        label: `${p.name} · ${p.generationProvider.name} ${p.generationModel}`,
      })),
    [data?.profiles],
  );

  const handleSave = async () => {
    if (!canManage || !websiteId) return;
    if (scope === "chatbot" && !chatbotProfileId) return;
    if (scope === "copilot" && !copilotProfileId) return;
    try {
      await updateMutation.mutateAsync({
        websiteId,
        body: {
          ...(scope === "copilot"
            ? { copilotProfileId }
            : { chatbotProfileId }),
          tone,
        },
      });
      publishAppToast({
        variant: "success",
        message:
          scope === "copilot"
            ? "AI Copilot configuration saved."
            : "AI Chatbot configuration saved.",
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

  const usage = data?.usage?.totals;
  const agents = data?.setup?.agents;

  const isCopilot = scope === "copilot";
  const title = isCopilot ? "AI Copilot configuration" : "AI Chatbot configuration";
  const description = data?.website.name
    ? isCopilot
      ? `${data.website.name} — inbox copilot LLM and usage`
      : `${data.website.name} — visitor chatbot LLM and usage`
    : isCopilot
      ? "Inbox copilot LLM and usage"
      : "Visitor chatbot LLM and usage";

  return (
    <FormModal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      onSave={() => {
        if (canManage) void handleSave();
      }}
      primaryButtonLabel={updateMutation.isPending ? "Saving…" : "Save configuration"}
      primaryButtonDisabled={
        updateMutation.isPending ||
        !canManage ||
        (scope === "chatbot" ? !chatbotProfileId : !copilotProfileId) ||
        setupQuery.isLoading
      }
      maxWidth={900}
      fitContent
      showCancelButton
      cancelButtonLabel="Close"
    >
      {setupQuery.isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Loading configuration…
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {usage ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                Token usage for this website
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ minWidth: 100 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total tokens
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formatTokenCount(usage.totalTokens)}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 100 }}>
                  <Typography variant="caption" color="text.secondary">
                    Chatbot
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatTokenCount(
                      data?.usage.byRole.find((r) => r.agentRole === "chatbot")
                        ?.totalTokens ?? 0,
                    )}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 100 }}>
                  <Typography variant="caption" color="text.secondary">
                    Copilot
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatTokenCount(
                      data?.usage.byRole.find((r) => r.agentRole === "copilot")
                        ?.totalTokens ?? 0,
                    )}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 100 }}>
                  <Typography variant="caption" color="text.secondary">
                    Requests
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {usage.requestCount}
                  </Typography>
                </Box>
              </Box>
              {data?.usage.byModel.length ? (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    By model version
                  </Typography>
                  {data.usage.byModel.map((row) => (
                    <Typography key={row.model ?? "unknown"} variant="caption" display="block">
                      {row.model ?? "unknown"} — {formatTokenCount(row.totalTokens)} tokens ·{" "}
                      {row.requestCount} req
                    </Typography>
                  ))}
                </Box>
              ) : null}
            </Box>
          ) : null}

          <SelectField
            label="Shared tone"
            value={tone}
            onChange={(v) => setTone(v as typeof tone)}
            options={TONE_OPTIONS}
            disabled={!canManage}
          />

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            {!isCopilot ? (
              <AgentDetailPanel
                title="Visitor chatbot"
                icon={<SmartToyOutlined color="primary" fontSize="small" />}
                agent={agents?.chatbot ?? null}
                profileOptions={profileOptions}
                profileId={chatbotProfileId}
                onProfileChange={setChatbotProfileId}
                canManage={canManage}
              />
            ) : (
              <AgentDetailPanel
                title="AI Copilot"
                icon={<SupportAgentOutlined color="primary" fontSize="small" />}
                agent={agents?.copilot ?? null}
                profileOptions={profileOptions}
                profileId={copilotProfileId}
                onProfileChange={setCopilotProfileId}
                canManage={canManage}
              />
            )}
          </Stack>

          {isCopilot && data?.copilotStatus?.inheritsFromChatbotAndAssistant ? (
            <Typography variant="caption" color="text.secondary">
              Copilot is inheriting the chatbot LLM because chatbot and assistant are both
              configured. Saving a dedicated profile here overrides inheritance.
            </Typography>
          ) : null}

          {data?.configuredProviders?.length ? (
            <Typography variant="caption" color="text.secondary">
              Available providers:{" "}
              {data.configuredProviders.map((p) => p.name).join(", ")}
            </Typography>
          ) : (
            <Typography variant="caption" color="error">
              No platform provider keys configured — add keys in AI provider configuration
              first.
            </Typography>
          )}
        </Box>
      )}
    </FormModal>
  );
}
