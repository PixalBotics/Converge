"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import QuizOutlined from "@mui/icons-material/QuizOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Button, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { AiTrainingFaqBuilder } from "./AiTrainingFaqBuilder";
import {
  compileFaqRowsToSourceRef,
  countValidFaqRows,
  createEmptyFaqRow,
  type FaqBuilderRow,
} from "./faq-builder.utils";
import { aiTrainingFilterGridSx } from "./ai-training-ui.styles";
import {
  CHATBOT_WEBSITE_URL_HELPER,
  hostFromWebsiteUrl,
  submitLabelForSourceType,
  suggestedSourceRef,
} from "./ai-training-kb.utils";
import type { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

/** UI method; website imports always use API sourceType `URL` (auto sitemap). */
export type ChatbotTrainingMethod = "URL" | "FAQ";

const CHATBOT_METHODS: {
  value: ChatbotTrainingMethod;
  title: string;
  summary: string;
  icon: ReactNode;
}[] = [
  {
    value: "URL",
    title: "Website URL",
    summary: "Paste your homepage — we find sitemap & scrape automatically",
    icon: <LanguageOutlined />,
  },
  {
    value: "FAQ",
    title: "Visitor FAQs",
    summary: "Question & answer pairs for the bot",
    icon: <QuizOutlined />,
  },
];

export function AiTrainingChatbotAddForm({
  hierarchy,
  createBusy,
  onSubmit,
  initialWebsiteId,
  initialMethod,
  onCancelHref,
}: {
  hierarchy: ReturnType<typeof useAiTrainingHierarchy>;
  createBusy: boolean;
  onSubmit: (payload: {
    websiteId: string;
    sourceType: string;
    sourceRef: string;
    title?: string;
  }) => Promise<void>;
  initialWebsiteId?: string;
  initialMethod?: ChatbotTrainingMethod;
  onCancelHref: string;
}) {
  const theme = useTheme() as AppTheme;
  const [method, setMethod] = useState<ChatbotTrainingMethod>(initialMethod ?? "URL");
  const [sourceRef, setSourceRef] = useState("");
  const [title, setTitle] = useState("");
  const [faqRows, setFaqRows] = useState<FaqBuilderRow[]>(() => [createEmptyFaqRow()]);

  const websiteId = hierarchy.websiteId.trim();
  const registeredUrl = hierarchy.selectedWebsite?.url ?? "";
  const registeredHost = hostFromWebsiteUrl(registeredUrl);

  useEffect(() => {
    if (initialWebsiteId) hierarchy.setWebsiteId(initialWebsiteId);
    if (initialMethod) setMethod(initialMethod);
  }, [initialWebsiteId, initialMethod]);

  useEffect(() => {
    if (!registeredUrl.trim()) return;
    if (method === "URL") {
      setSourceRef(suggestedSourceRef("URL", registeredUrl));
    } else {
      setSourceRef("");
    }
  }, [method, registeredUrl, websiteId]);

  const canSubmit = useMemo(() => {
    if (!websiteId || !hierarchy.hierarchyReady) return false;
    if (method === "FAQ") return countValidFaqRows(faqRows) > 0;
    return Boolean(sourceRef.trim());
  }, [websiteId, hierarchy.hierarchyReady, method, faqRows, sourceRef]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const ref = method === "FAQ" ? compileFaqRowsToSourceRef(faqRows) : sourceRef.trim();
    await onSubmit({
      websiteId,
      sourceType: method === "FAQ" ? "FAQ" : "URL",
      sourceRef: ref,
      title: title.trim() || undefined,
    });
  };

  return (
    <DashboardCard sx={{ p: 2.5 }}>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
        Step 1 — pick website. Step 2 — paste your site URL or FAQs. We handle sitemap discovery and
        scraping in the background.
      </Typography>

      <Typography variant="body2" fontWeight={600} color="white" sx={{ mb: 1 }}>
        1. Website
      </Typography>
      <Box sx={aiTrainingFilterGridSx}>
        <SelectField
          label="Reseller"
          value={hierarchy.resellerId}
          onChange={hierarchy.onResellerChange}
          options={hierarchy.resellerSelectOptions}
          disabled={
            hierarchy.resellersQuery.isLoading ||
            Boolean(hierarchy.sessionResellerId && !hierarchy.mayPickResellerFilter)
          }
          menuMaxRows={8}
        />
        <SelectField
          label="Parent company"
          value={hierarchy.parentCompanyId}
          onChange={hierarchy.onParentChange}
          options={hierarchy.parentCompanyOptions}
          disabled={!hierarchy.hierarchyResellerKey || hierarchy.companiesByResellerQuery.isLoading}
          menuMaxRows={8}
        />
        <SelectField
          label="Child company"
          value={hierarchy.childCompanyId}
          onChange={hierarchy.onChildChange}
          options={hierarchy.childCompanyOptions}
          disabled={!hierarchy.parentCompanyId.trim()}
          menuMaxRows={8}
        />
        <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1", lg: "1 / -1" }, mb: { xs: 0, sm: 0.5 } }}>
          <SelectField
            label="Website"
            value={hierarchy.websiteId}
            onChange={hierarchy.setWebsiteId}
            options={hierarchy.websiteOptions}
            disabled={!hierarchy.hierarchyReady || hierarchy.websitesLoading}
            menuMaxRows={10}
          />
        </Box>
      </Box>

      {registeredHost ? (
        <Alert severity="info" variant="outlined" sx={{ mb: 2, bgcolor: "transparent" }}>
          Use a URL on <strong>{registeredHost}</strong> — we find the sitemap and scrape for you.
        </Alert>
      ) : websiteId ? (
        <Alert severity="warning" variant="outlined" sx={{ mb: 2, bgcolor: "transparent" }}>
          This website has no URL — add one in website settings before scraping.
        </Alert>
      ) : null}

      <Typography variant="body2" fontWeight={600} color="white" sx={{ mb: 1 }}>
        2. Training type
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 1,
          mb: 2,
        }}
      >
        {CHATBOT_METHODS.map((m) => {
          const selected = method === m.value;
          return (
            <Box
              key={m.value}
              role="button"
              tabIndex={0}
              onClick={() => setMethod(m.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setMethod(m.value);
                }
              }}
              sx={{
                p: 1.5,
                borderRadius: 2,
                cursor: "pointer",
                border: `1px solid ${selected ? theme.app.dashboard.accentBlue : theme.app.dashboard.cardBorder}`,
                bgcolor: selected ? "rgba(99, 102, 241, 0.15)" : "transparent",
              }}
            >
              <Box sx={{ color: theme.app.dashboard.accentBlue, mb: 0.5 }}>{m.icon}</Box>
              <Typography variant="body2" fontWeight={700} color="white">
                {m.title}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {m.summary}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Typography variant="body2" fontWeight={600} color="white" sx={{ mb: 1 }}>
        3. Content
      </Typography>
      {method === "FAQ" ? (
        <AiTrainingFaqBuilder
          rows={faqRows}
          onRowsChange={setFaqRows}
          onCompiledChange={setSourceRef}
          variant="chatbot"
        />
      ) : (
        <Stack spacing={1.5}>
          <InputField
            label="Website URL"
            value={sourceRef}
            onChange={(e) => setSourceRef(e.target.value)}
            placeholder={
              registeredUrl ? suggestedSourceRef("URL", registeredUrl) : "https://your-domain.com"
            }
          />
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {CHATBOT_WEBSITE_URL_HELPER}
          </Typography>
          <InputField
            label="Label (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Shown in the content list"
          />
        </Stack>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
        <Button type="button" variant="secondary" href={onCancelHref} disabled={createBusy}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          sx={gradientPrimaryButtonSx}
          disabled={!canSubmit || createBusy}
          onClick={() => void handleSubmit()}
        >
          {createBusy ? "Starting training…" : submitLabelForSourceType(method, false)}
        </Button>
      </Box>
    </DashboardCard>
  );
}
