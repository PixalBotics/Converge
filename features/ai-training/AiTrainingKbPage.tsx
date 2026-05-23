"use client";

import { useEffect, useMemo, useState } from "react";
import AutoStories from "@mui/icons-material/AutoStories";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { KnowledgeSourceStatus } from "@/api/ai-knowledge/types";
import {
  integrationsHeaderActions,
  integrationsPageHeader,
  integrationsPageWrapper,
} from "@/app/dashboard/integrations/integrations.styles";
import {
  Button,
  DashboardCard,
  InputField,
  Label,
  SelectField,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import {
  useAiAssistantKbReindexMutation,
  useAiAssistantKbSourcesQuery,
  useAiChatbotReindexMutation,
  useAiChatbotSourcesQuery,
  useCreateAiAssistantKbSourceMutation,
  useCreateAiChatbotSourceMutation,
  useDeleteAiAssistantKbSourceMutation,
  useDeleteAiChatbotSourceMutation,
} from "@/lib/hooks/query/ai-knowledge";
import { AiTrainingSourcesTable } from "./AiTrainingSourcesTable";
import {
  assistantFileAcceptForSourceType,
  assistantFileUploadButtonLabel,
  defaultSourceTypeForVariant,
  isFileUploadSourceType,
  isReindexBulkResult,
  isTextSourceType,
  isValidOptionalMetadataJson,
  sourceRefHelperText,
  sourceTypeOptionsForVariant,
  toastMessageForCreateResult,
  type AiTrainingKbVariant,
} from "./ai-training-kb.utils";
import { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

const LIST_LIMIT = 20;

const VARIANT_COPY: Record<
  AiTrainingKbVariant,
  { title: string; subtitle: string; sourceSectionHint: string }
> = {
  assistant: {
    title: "AI Assistant",
    subtitle:
      "Train internal knowledge (FAQ, PDF, DOCX, SOP) for agent copilot. Uses POST /ai-assistant/kb/sources — scope is fixed to ASSISTANT.",
    sourceSectionHint:
      "Create runs ingest + index immediately. Upload Excel, PDF, or DOCX (max 100 MB) or paste FAQ/SOP text. Failed rows show errorMessage in the list below.",
  },
  chatbot: {
    title: "AI Chatbot",
    subtitle:
      "Train visitor chatbot knowledge (CHATBOT scope). FAQs, single-page URLs, crawls, or sitemaps via POST /ai-chatbot/sources.",
    sourceSectionHint:
      "Paste visitor FAQs or submit a URL (JSON only, no file uploads). Crawl and large sites may take 10–60+ seconds — wait for the response before submitting again.",
  },
};

export function AiTrainingKbPage({ variant }: { variant: AiTrainingKbVariant }) {
  const theme = useTheme() as AppTheme;
  const copy = VARIANT_COPY[variant];
  const HeaderIcon = variant === "chatbot" ? SmartToyOutlined : AutoStories;
  const sourceTypeOptions = sourceTypeOptionsForVariant(variant);
  const isChatbot = variant === "chatbot";

  const hierarchy = useAiTrainingHierarchy();

  const [sourceType, setSourceType] = useState<string>(() => defaultSourceTypeForVariant(variant));
  const [sourceRef, setSourceRef] = useState("");
  const [title, setTitle] = useState("");
  const [metadataJson, setMetadataJson] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [listOffset, setListOffset] = useState(0);
  const [reindexIncludeFailed, setReindexIncludeFailed] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);

  const createChatbot = useCreateAiChatbotSourceMutation();
  const createAssistant = useCreateAiAssistantKbSourceMutation();
  const deleteChatbot = useDeleteAiChatbotSourceMutation();
  const deleteAssistant = useDeleteAiAssistantKbSourceMutation();
  const reindexChatbot = useAiChatbotReindexMutation();
  const reindexAssistant = useAiAssistantKbReindexMutation();

  const websiteId = hierarchy.websiteId.trim();

  const listParams = useMemo(
    () => ({
      websiteId: websiteId || undefined,
      ...(statusFilter ? { status: statusFilter as KnowledgeSourceStatus } : {}),
      limit: LIST_LIMIT,
      offset: listOffset,
    }),
    [websiteId, statusFilter, listOffset],
  );

  useEffect(() => {
    setListOffset(0);
  }, [websiteId, statusFilter]);

  const chatbotList = useAiChatbotSourcesQuery(listParams, { enabled: isChatbot });
  const assistantList = useAiAssistantKbSourcesQuery(listParams, { enabled: !isChatbot });

  const sourcesQuery = isChatbot ? chatbotList : assistantList;
  const listItems = sourcesQuery.data?.items ?? [];
  const listTotal = sourcesQuery.data?.total ?? 0;

  const metadataValid = isValidOptionalMetadataJson(metadataJson);
  const createBusy = createChatbot.isPending || createAssistant.isPending;
  const reindexBusy = reindexChatbot.isPending || reindexAssistant.isPending;

  const canSubmitSource =
    Boolean(websiteId) &&
    metadataValid &&
    !createBusy &&
    (isFileUploadSourceType(sourceType) && uploadFile
      ? true
      : isTextSourceType(sourceType)
        ? sourceRef.trim().length >= (sourceType === "SOP" ? 20 : 1)
        : isFileUploadSourceType(sourceType)
          ? Boolean(sourceRef.trim()) || Boolean(uploadFile)
          : Boolean(sourceRef.trim()));

  const submitSource = async () => {
    if (!websiteId) {
      publishAppToast({ variant: "error", message: "Select a website so KB is tied to the correct site." });
      return;
    }
    if (!metadataValid) {
      publishAppToast({
        variant: "error",
        message: "metadataJson must be empty or valid JSON.",
      });
      return;
    }
    if (sourceType === "SOP" && sourceRef.trim().length < 20) {
      publishAppToast({ variant: "error", message: "SOP text must be at least 20 characters." });
      return;
    }
    if (isFileUploadSourceType(sourceType)) {
      if (!uploadFile && !sourceRef.trim()) {
        publishAppToast({ variant: "error", message: "Upload a file or provide a public document URL." });
        return;
      }
    } else if (!sourceRef.trim()) {
      publishAppToast({ variant: "error", message: "Source content is required." });
      return;
    }

    const metaTrim = metadataJson.trim();
    const titleTrim = title.trim() || undefined;

    try {
      let result;
      if (isChatbot) {
        result = await createChatbot.mutateAsync({
          websiteId,
          sourceType,
          sourceRef: sourceRef.trim(),
          title: titleTrim,
          ...(metaTrim ? { metadataJson: metaTrim } : {}),
        });
      } else if (isFileUploadSourceType(sourceType) && uploadFile) {
        result = await createAssistant.mutateAsync({
          websiteId,
          sourceType: sourceType as "PDF" | "DOCX" | "EXCEL",
          file: uploadFile,
          title: titleTrim ?? uploadFile.name,
          ...(metaTrim ? { metadataJson: metaTrim } : {}),
        });
      } else {
        result = await createAssistant.mutateAsync({
          websiteId,
          sourceType,
          sourceRef: sourceRef.trim(),
          title: titleTrim,
          ...(metaTrim ? { metadataJson: metaTrim } : {}),
        });
      }

      const toast = toastMessageForCreateResult(result);
      publishAppToast({ variant: toast.variant, message: toast.message });
      if (result.status !== "failed") {
        setSourceRef("");
        setUploadFile(null);
      }
      void sourcesQuery.refetch();
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Could not create knowledge source.",
      });
    }
  };

  const runBulkReindex = async () => {
    if (!websiteId) {
      publishAppToast({ variant: "error", message: "Select a website first." });
      return;
    }
    try {
      const body = {
        websiteId,
        ...(reindexIncludeFailed ? { includeFailed: true } : {}),
      };
      const raw = isChatbot
        ? await reindexChatbot.mutateAsync(body)
        : await reindexAssistant.mutateAsync(body);

      if (isReindexBulkResult(raw)) {
        const failed = raw.results.filter((r) => r.status === "failed").length;
        publishAppToast({
          variant: failed > 0 ? "error" : "success",
          message: `Reindexed ${raw.count} source(s)${failed > 0 ? ` — ${failed} failed` : ""}.`,
        });
      } else {
        const toast = toastMessageForCreateResult(raw);
        publishAppToast({ variant: toast.variant, message: toast.message });
      }
      void sourcesQuery.refetch();
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Reindex failed.",
      });
    }
  };

  const handleRowReindex = async (sourceId: string) => {
    setRowBusyId(sourceId);
    try {
      const raw = isChatbot
        ? await reindexChatbot.mutateAsync({ sourceId })
        : await reindexAssistant.mutateAsync({ sourceId });
      const payload = isReindexBulkResult(raw) ? raw.results[0] : raw;
      if (payload) {
        const toast = toastMessageForCreateResult(payload);
        publishAppToast({ variant: toast.variant, message: toast.message });
      }
      void sourcesQuery.refetch();
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Reindex failed.",
      });
    } finally {
      setRowBusyId(null);
    }
  };

  const handleRowDelete = async (sourceId: string) => {
    setRowBusyId(sourceId);
    try {
      if (isChatbot) {
        await deleteChatbot.mutateAsync(sourceId);
      } else {
        await deleteAssistant.mutateAsync(sourceId);
      }
      publishAppToast({ variant: "success", message: "Source deleted." });
      void sourcesQuery.refetch();
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Delete failed.",
      });
    } finally {
      setRowBusyId(null);
    }
  };

  return (
    <Box sx={integrationsPageWrapper}>
      <Box sx={integrationsPageHeader}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <HeaderIcon sx={{ color: theme.app.dashboard.accentBlue, fontSize: 28 }} />
            <Typography variant="regularLarge" fontWeight={700} color="white">
              {copy.title}
            </Typography>
          </Stack>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            {copy.subtitle}
          </Typography>
        </Box>
        {variant === "assistant" ? (
          <Box sx={integrationsHeaderActions}>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 280 }}>
              Requires page:chat and chat:access (or chat-widget permissions for some actions).
            </Typography>
          </Box>
        ) : (
          <Box sx={integrationsHeaderActions}>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 280 }}>
              Requires page:chat-widget and chat-widget:update to create sources.
            </Typography>
          </Box>
        )}
      </Box>

      {(createBusy || reindexBusy) && (
        <LinearProgress sx={{ borderRadius: 1, maxWidth: 1100, mx: "auto", width: "100%" }} />
      )}

      <Stack spacing={2.5} sx={{ maxWidth: 1100, mx: "auto", width: "100%" }}>
        <DashboardCard sx={{ p: 2.5 }}>
          <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
            1. Target website
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
            Select hierarchy, then choose website — list and create APIs filter by this websiteId.
          </Typography>
          <Stack spacing={1.75}>
            <SelectField
              label="Reseller"
              placeholder="Select reseller"
              value={hierarchy.resellerId}
              onChange={hierarchy.onResellerChange}
              options={hierarchy.resellerSelectOptions}
              disabled={
                hierarchy.resellersQuery.isLoading ||
                Boolean(hierarchy.sessionResellerId && !hierarchy.mayPickResellerFilter)
              }
              searchPlaceholder="Search reseller…"
              menuMaxRows={10}
            />
            {hierarchy.companiesError ? (
              <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
                {hierarchy.companiesError}
              </Typography>
            ) : null}
            <SelectField
              label="Parent company"
              placeholder="Select parent company"
              value={hierarchy.parentCompanyId}
              onChange={hierarchy.onParentChange}
              options={hierarchy.parentCompanyOptions}
              disabled={
                !hierarchy.hierarchyResellerKey ||
                hierarchy.companiesByResellerQuery.isLoading ||
                Boolean(hierarchy.companiesError)
              }
              searchPlaceholder="Search parent company…"
              menuMaxRows={10}
            />
            <SelectField
              label="Child company"
              placeholder="Select child company"
              value={hierarchy.childCompanyId}
              onChange={hierarchy.onChildChange}
              options={hierarchy.childCompanyOptions}
              disabled={
                !hierarchy.parentCompanyId.trim() || hierarchy.companiesByResellerQuery.isLoading
              }
              searchPlaceholder="Search child company…"
              menuMaxRows={10}
            />
            <SelectField
              label="Website"
              placeholder={hierarchy.websitesLoading ? "Loading…" : "Select website"}
              value={hierarchy.websiteId}
              onChange={hierarchy.setWebsiteId}
              options={hierarchy.websiteOptions}
              disabled={
                !hierarchy.hierarchyReady ||
                hierarchy.websitesLoading ||
                !hierarchy.hasWebsiteChoices
              }
              searchPlaceholder="Search website…"
              menuMaxRows={10}
            />
            {hierarchy.sitesError ? (
              <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
                {hierarchy.sitesError}
              </Typography>
            ) : null}
            {websiteId ? (
              <Alert severity="info" variant="outlined" sx={{ bgcolor: "transparent" }}>
                Selected <strong>websiteId</strong>:{" "}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
                >
                  {websiteId}
                </Typography>
              </Alert>
            ) : null}
          </Stack>
        </DashboardCard>

        <DashboardCard sx={{ p: 2.5 }}>
          <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
            2. Add knowledge source
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
            {copy.sourceSectionHint}
          </Typography>

          <Stack spacing={1.75}>
            <SelectField
              label="Source type"
              placeholder="Type"
              value={sourceType}
              onChange={(v) => {
                setSourceType(v);
                setUploadFile(null);
                setSourceRef("");
              }}
              options={sourceTypeOptions}
              searchable={false}
            />

            {isTextSourceType(sourceType) ? (
              <Box>
                <Label
                  htmlFor={`ai-training-text-${variant}`}
                  variant="mediumLarge"
                  sx={{ display: "block", mb: 0.75 }}
                >
                  {sourceType === "SOP" ? "Procedure text" : "FAQ / policy text"}
                </Label>
                <TextField
                  id={`ai-training-text-${variant}`}
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                  placeholder={
                    sourceType === "SOP"
                      ? "Step 1: …\nStep 2: …"
                      : isChatbot
                        ? "What is your return policy?\nReturns within 14 days.\n\nWhat are your hours?\nMon–Fri 9am–6pm."
                        : "Paste policies, FAQs, product notes…"
                  }
                  multiline
                  minRows={8}
                  fullWidth
                  sx={textFieldStyles(theme)}
                />
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 0.75, color: theme.app.dashboard.textMuted }}
                >
                  {sourceRefHelperText(sourceType, variant)}
                </Typography>
              </Box>
            ) : (
              <>
                <InputField
                  label={
                    isFileUploadSourceType(sourceType)
                      ? "Document URL (optional if uploading)"
                      : "Web URL"
                  }
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                  placeholder={
                    sourceType === "SITEMAP"
                      ? "https://example.com/sitemap.xml"
                      : sourceType === "EXCEL"
                        ? "https://…/workbook.xlsx"
                        : sourceType === "PDF"
                          ? "https://…/document.pdf"
                          : sourceType === "DOCX"
                            ? "https://…/document.docx"
                            : "https://…"
                  }
                  inputProps={{ maxLength: 2048 }}
                  helperText={sourceRefHelperText(sourceType, variant)}
                />
                {isFileUploadSourceType(sourceType) ? (
                  <Box>
                    <Button type="button" variant="secondary" component="label" disabled={createBusy}>
                      {assistantFileUploadButtonLabel(sourceType)}
                      <input
                        type="file"
                        accept={assistantFileAcceptForSourceType(sourceType)}
                        hidden
                        onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                      />
                    </Button>
                    {uploadFile ? (
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mt: 0.75, color: theme.app.dashboard.textMuted }}
                      >
                        Selected: {uploadFile.name}
                      </Typography>
                    ) : null}
                  </Box>
                ) : null}
              </>
            )}

            <InputField
              label="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Display name in admin list"
              inputProps={{ maxLength: 255 }}
            />

            {isChatbot ? (
              <InputField
                label="metadataJson (optional)"
                value={metadataJson}
                onChange={(e) => setMetadataJson(e.target.value)}
                placeholder='{"locale":"en"}'
                error={!metadataValid}
                helperText={
                  metadataValid
                    ? "Valid JSON string when non-empty."
                    : "Invalid JSON — fix or clear this field."
                }
              />
            ) : null}

            <Divider sx={{ borderColor: "divider" }} />

            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              disabled={!canSubmitSource}
              onClick={() => void submitSource()}
            >
              {createBusy
                ? "Indexing…"
                : sourceType === "FAQ"
                  ? "Create FAQ & index"
                  : isChatbot
                    ? "Create & index"
                    : "Create source & index"}
            </Button>
          </Stack>
        </DashboardCard>

        <DashboardCard sx={{ p: 2.5 }}>
          <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
            3. Knowledge sources
          </Typography>
          <AiTrainingSourcesTable
            websiteId={websiteId}
            items={listItems}
            total={listTotal}
            limit={LIST_LIMIT}
            offset={listOffset}
            isLoading={sourcesQuery.isLoading}
            isFetching={sourcesQuery.isFetching}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onOffsetChange={setListOffset}
            onRefresh={() => void sourcesQuery.refetch()}
            onReindexRow={(id) => void handleRowReindex(id)}
            onDeleteRow={(id) => void handleRowDelete(id)}
            rowBusyId={rowBusyId}
          />
        </DashboardCard>

        <DashboardCard sx={{ p: 2.5 }}>
          <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
            4. Bulk reindex
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
            Reindex all sources for the selected website
            {isChatbot ? " (CHATBOT scope)" : " (ASSISTANT scope)"}.
          </Typography>
          <Stack spacing={1.5}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reindexIncludeFailed}
                  onChange={(e) => setReindexIncludeFailed(e.target.checked)}
                  size="small"
                  sx={{ color: theme.app.dashboard.textMuted }}
                />
              }
              label={
                <Typography variant="medium" sx={{ color: theme.app.dashboard.white95 }}>
                  Include previously failed sources
                </Typography>
              }
            />
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              disabled={reindexBusy || !websiteId}
              onClick={() => void runBulkReindex()}
            >
              {reindexBusy ? "Reindexing…" : "Reindex all for this website"}
            </Button>
          </Stack>
        </DashboardCard>
      </Stack>
    </Box>
  );
}
