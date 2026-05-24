"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import MapOutlined from "@mui/icons-material/MapOutlined";
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
  hostFromWebsiteUrl,
  submitLabelForSourceType,
  suggestedSourceRef,
} from "./ai-training-kb.utils";
import type { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

export type ChatbotTrainingMethod = "SITEMAP" | "URL" | "FAQ";

const CHATBOT_METHODS: {
  value: ChatbotTrainingMethod;
  title: string;
  summary: string;
  icon: ReactNode;
}[] = [
  {
    value: "SITEMAP",
    title: "Sitemap (full site)",
    summary: "Import from sitemap.xml — up to ~25 pages",
    icon: <MapOutlined />,
  },
  {
    value: "URL",
    title: "Single page URL",
    summary: "One page only — pricing, FAQ page, etc.",
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
  const [method, setMethod] = useState<ChatbotTrainingMethod>(initialMethod ?? "SITEMAP");
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
    if (method === "SITEMAP") {
      setSourceRef(suggestedSourceRef("SITEMAP", registeredUrl));
    } else if (method === "URL") {
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
      sourceType: method,
      sourceRef: ref,
      title: title.trim() || undefined,
    });
  };

  return (
    <DashboardCard sx={{ p: 2.5 }}>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
        Step 1 — website. Step 2 — how to train. Step 3 — paste URL or FAQs. After save you can review items on the
        website detail page.
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
          Scraping must use domain: <strong>{registeredHost}</strong>
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
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
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
            label={method === "SITEMAP" ? "Sitemap URL" : "Page URL"}
            value={sourceRef}
            onChange={(e) => setSourceRef(e.target.value)}
            placeholder={
              registeredUrl ? suggestedSourceRef(method, registeredUrl) : "https://your-domain.com/..."
            }
          />
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
          {createBusy ? "Training…" : submitLabelForSourceType(method, false)}
        </Button>
      </Box>
    </DashboardCard>
  );
}
