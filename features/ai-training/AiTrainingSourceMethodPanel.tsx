"use client";

import { useEffect, useMemo, useState } from "react";
import ArticleOutlined from "@mui/icons-material/ArticleOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import MapOutlined from "@mui/icons-material/MapOutlined";
import QuizOutlined from "@mui/icons-material/QuizOutlined";
import TravelExploreOutlined from "@mui/icons-material/TravelExploreOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Label, Typography } from "@/components/common";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import { AiTrainingFaqBuilder } from "./AiTrainingFaqBuilder";
import type { FaqBuilderRow } from "./faq-builder.utils";
import {
  assistantFileAcceptForSourceType,
  assistantFileUploadButtonLabel,
  categoryForSourceType,
  hostFromWebsiteUrl,
  isFileUploadSourceType,
  isTextSourceType,
  isWebSourceType,
  sourceCategoriesForVariant,
  sourceInputLabel,
  sourceMethodCardsForCategory,
  sourceRefHelperText,
  suggestedSourceRef,
  type AiTrainingKbVariant,
  type AiTrainingSourceCategory,
} from "./ai-training-kb.utils";

function MethodIcon({ sourceType }: { sourceType: string }) {
  const sx = { fontSize: 28, opacity: 0.9 };
  switch (sourceType) {
    case "SITEMAP":
      return <MapOutlined sx={sx} />;
    case "WEB_CRAWL":
      return <TravelExploreOutlined sx={sx} />;
    case "URL":
      return <LanguageOutlined sx={sx} />;
    case "FAQ":
      return <QuizOutlined sx={sx} />;
    case "SOP":
      return <ArticleOutlined sx={sx} />;
    default:
      return <DescriptionOutlined sx={sx} />;
  }
}

export function AiTrainingSourceMethodPanel({
  variant,
  sourceType,
  onSourceTypeChange,
  sourceRef,
  onSourceRefChange,
  title,
  onTitleChange,
  uploadFile,
  onUploadFileChange,
  registeredWebsiteUrl,
  createBusy,
  canSubmit,
  onSubmit,
  submitLabel,
  faqRows,
  onFaqRowsChange,
  onFaqCompiledChange,
  initialCategory,
}: {
  variant: AiTrainingKbVariant;
  sourceType: string;
  onSourceTypeChange: (type: string) => void;
  sourceRef: string;
  onSourceRefChange: (v: string) => void;
  title: string;
  onTitleChange: (v: string) => void;
  uploadFile: File | null;
  onUploadFileChange: (f: File | null) => void;
  registeredWebsiteUrl: string;
  createBusy: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  submitLabel: string;
  faqRows: FaqBuilderRow[];
  onFaqRowsChange: (rows: FaqBuilderRow[]) => void;
  onFaqCompiledChange: (compiled: string) => void;
  initialCategory?: AiTrainingSourceCategory;
}) {
  const theme = useTheme() as AppTheme;
  const categories = sourceCategoriesForVariant(variant);
  const registeredHost = hostFromWebsiteUrl(registeredWebsiteUrl);

  const [category, setCategory] = useState<AiTrainingSourceCategory>(
    () => initialCategory ?? categoryForSourceType(sourceType, variant),
  );

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (!initialCategory) {
      setCategory(categoryForSourceType(sourceType, variant));
    }
  }, [sourceType, variant, initialCategory]);

  const methodCards = useMemo(
    () => sourceMethodCardsForCategory(category, variant, registeredHost),
    [category, variant, registeredHost],
  );

  const activeCard = methodCards.find((c) => c.value === sourceType) ?? methodCards[0];

  const handleCategoryChange = (next: AiTrainingSourceCategory) => {
    setCategory(next);
    const cards = sourceMethodCardsForCategory(next, variant, registeredHost);
    const first = cards[0]?.value;
    if (first) {
      onSourceTypeChange(first);
      onUploadFileChange(null);
      if (isWebSourceType(first) && registeredWebsiteUrl.trim()) {
        onSourceRefChange(suggestedSourceRef(first, registeredWebsiteUrl));
      } else if (isTextSourceType(first)) {
        onSourceRefChange("");
      } else {
        onSourceRefChange("");
      }
    }
  };

  const handleMethodSelect = (value: string) => {
    onSourceTypeChange(value);
    onUploadFileChange(null);
    if (isTextSourceType(value)) {
      onSourceRefChange("");
    } else if (isWebSourceType(value) && registeredWebsiteUrl.trim()) {
      onSourceRefChange(suggestedSourceRef(value, registeredWebsiteUrl));
    } else if (isFileUploadSourceType(value)) {
      onSourceRefChange("");
    }
  };

  const fillSuggestedUrl = () => {
    const next = suggestedSourceRef(sourceType, registeredWebsiteUrl);
    if (next) onSourceRefChange(next);
  };

  return (
    <Stack spacing={2}>
      <Tabs
        value={category}
        onChange={(_, v) => handleCategoryChange(v as AiTrainingSourceCategory)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 40,
          "& .MuiTab-root": {
            color: theme.app.dashboard.textMuted,
            textTransform: "none",
            fontWeight: 600,
            minHeight: 40,
          },
          "& .Mui-selected": { color: theme.app.dashboard.accentBlue },
          "& .MuiTabs-indicator": { bgcolor: theme.app.dashboard.accentBlue },
        }}
      >
        {categories.map((cat) => (
          <Tab
            key={cat.id}
            value={cat.id}
            label={
              <Box sx={{ textAlign: "left" }}>
                <Typography component="span" variant="body2" fontWeight={700}>
                  {cat.label}
                </Typography>
              </Box>
            }
          />
        ))}
      </Tabs>

      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: -1 }}>
        {categories.find((c) => c.id === category)?.description}
      </Typography>

      {variant === "chatbot" && category === "website" && registeredHost ? (
        <Alert severity="info" variant="outlined" sx={{ bgcolor: "transparent" }}>
          Scraping is limited to your registered site:{" "}
          <strong>{registeredHost}</strong>. URLs on other domains are rejected.
        </Alert>
      ) : null}

      {variant === "assistant" && category === "website" && registeredHost ? (
        <Alert severity="info" variant="outlined" sx={{ bgcolor: "transparent" }}>
          Agent copilot scraping is limited to <strong>{registeredHost}</strong> — same as
          chatbot, but stored separately for internal use only.
        </Alert>
      ) : null}

      {!registeredHost && category === "website" ? (
        <Alert severity="warning" variant="outlined" sx={{ bgcolor: "transparent" }}>
          Select a website above first — we need its registered URL to validate scrape targets.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: methodCards.length > 1 ? "repeat(3, 1fr)" : "1fr" },
          gap: 1.25,
        }}
      >
        {methodCards.map((card) => {
          const selected = card.value === sourceType;
          return (
            <Box
              key={card.value}
              role="button"
              tabIndex={0}
              onClick={() => handleMethodSelect(card.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleMethodSelect(card.value);
                }
              }}
              sx={{
                p: 1.75,
                borderRadius: 2,
                cursor: "pointer",
                border: `1px solid ${
                  selected ? theme.app.dashboard.accentBlue : theme.app.dashboard.cardBorder
                }`,
                bgcolor: selected ? "rgba(99, 102, 241, 0.12)" : "rgba(255,255,255,0.03)",
                transition: "border-color 0.15s, background 0.15s",
                "&:hover": {
                  borderColor: theme.app.dashboard.accentBlue,
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                <Box sx={{ color: theme.app.dashboard.accentBlue }}>
                  <MethodIcon sourceType={card.value} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} color="white">
                    {card.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.25 }}
                  >
                    {card.summary}
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {card.bestFor}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {activeCard ? (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px dashed ${theme.app.dashboard.cardBorder}`,
            bgcolor: "rgba(255,255,255,0.02)",
          }}
        >
          <Typography variant="body2" fontWeight={700} color="white" sx={{ mb: 1 }}>
            What happens when you submit
          </Typography>
          <Stack spacing={0.75}>
            {activeCard.flowSteps.map((step, i) => (
              <Stack key={step} direction="row" spacing={1} alignItems="flex-start">
                <Chip
                  label={i + 1}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    bgcolor: "rgba(99, 102, 241, 0.25)",
                    color: "#c7d2fe",
                  }}
                />
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, pt: 0.25 }}>
                  {step}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      ) : null}

      {sourceType === "FAQ" ? (
        <AiTrainingFaqBuilder
          rows={faqRows}
          onRowsChange={onFaqRowsChange}
          onCompiledChange={onFaqCompiledChange}
          variant={variant}
        />
      ) : sourceType === "SOP" ? (
        <Box>
          <Label
            htmlFor={`ai-training-sop-${variant}`}
            variant="mediumLarge"
            sx={{ display: "block", mb: 0.75 }}
          >
            {sourceInputLabel(sourceType)}
          </Label>
          <TextField
            id={`ai-training-sop-${variant}`}
            value={sourceRef}
            onChange={(e) => onSourceRefChange(e.target.value)}
            placeholder="Step 1: …\nStep 2: …"
            multiline
            minRows={10}
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
      ) : isTextSourceType(sourceType) ? null : (
        <>
          <InputField
            label={sourceInputLabel(sourceType)}
            value={sourceRef}
            onChange={(e) => onSourceRefChange(e.target.value)}
            placeholder={
              isWebSourceType(sourceType) && registeredHost
                ? suggestedSourceRef(sourceType, registeredWebsiteUrl) ||
                  `https://${registeredHost}/…`
                : sourceType === "EXCEL"
                  ? "https://…/catalog.xlsx"
                  : "https://…"
            }
            inputProps={{ maxLength: 2048 }}
            helperText={sourceRefHelperText(sourceType, variant)}
          />
          {isWebSourceType(sourceType) && registeredWebsiteUrl.trim() ? (
            <Button type="button" variant="secondary" size="small" onClick={fillSuggestedUrl}>
              Use suggested URL for this website
            </Button>
          ) : null}
          {isFileUploadSourceType(sourceType) ? (
            <Box>
              <Button type="button" variant="secondary" component="label" disabled={createBusy}>
                {assistantFileUploadButtonLabel(sourceType)}
                <input
                  type="file"
                  accept={assistantFileAcceptForSourceType(sourceType)}
                  hidden
                  onChange={(e) => onUploadFileChange(e.target.files?.[0] ?? null)}
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
        label="Display name (optional)"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder={
          isWebSourceType(sourceType)
            ? "e.g. Main site sitemap — May 2026"
            : "Shown in the sources list below"
        }
        inputProps={{ maxLength: 255 }}
      />

      <Button type="button" variant="primary" disabled={!canSubmit || createBusy} onClick={onSubmit}>
        {createBusy ? "Working…" : submitLabel}
      </Button>
    </Stack>
  );
}
