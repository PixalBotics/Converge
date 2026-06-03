"use client";

import Box from "@mui/material/Box";
import { DashboardCard, Button, SelectField, Typography } from "@/components/common";
import { aiTrainingFilterGridSx } from "./ai-training-ui.styles";
import { AiTrainingSourceMethodPanel } from "./AiTrainingSourceMethodPanel";
import { submitLabelForSourceType } from "./ai-training-kb.utils";
import type { FaqBuilderRow } from "./faq-builder.utils";
import type { AiTrainingSourceCategory } from "./ai-training-kb.utils";
import type { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

export function AiTrainingAssistantAddForm({
  hierarchy,
  sourceType,
  onSourceTypeChange,
  sourceRef,
  onSourceRefChange,
  title,
  onTitleChange,
  uploadFile,
  onUploadFileChange,
  faqRows,
  onFaqRowsChange,
  onFaqCompiledChange,
  faqCategoryFocus,
  createBusy,
  canSubmit,
  onSubmit,
  onCancelHref,
}: {
  hierarchy: ReturnType<typeof useAiTrainingHierarchy>;
  sourceType: string;
  onSourceTypeChange: (v: string) => void;
  sourceRef: string;
  onSourceRefChange: (v: string) => void;
  title: string;
  onTitleChange: (v: string) => void;
  uploadFile: File | null;
  onUploadFileChange: (f: File | null) => void;
  faqRows: FaqBuilderRow[];
  onFaqRowsChange: (rows: FaqBuilderRow[]) => void;
  onFaqCompiledChange: (v: string) => void;
  faqCategoryFocus?: AiTrainingSourceCategory;
  createBusy: boolean;
  canSubmit: boolean;
  onSubmit: () => Promise<void>;
  onCancelHref: string;
}) {
  const registeredUrl = hierarchy.selectedWebsite?.url ?? "";

  return (
    <DashboardCard sx={{ p: 2.5 }}>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        Pick the website, then scrape your site or add FAQs, documents, or SOP text. Each add becomes a
        content item agents can search in the copilot.
      </Typography>

      <Box sx={aiTrainingFilterGridSx}>
        <SelectField
          label="Reseller"
          value={hierarchy.resellerId}
          onChange={hierarchy.onResellerChange}
          options={hierarchy.resellerSelectOptions}
          menuMaxRows={8}
        />
        <SelectField
          label="Parent company"
          value={hierarchy.parentCompanyId}
          onChange={hierarchy.onParentChange}
          options={hierarchy.parentCompanyOptions}
          disabled={!hierarchy.hierarchyResellerKey}
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
            disabled={!hierarchy.hierarchyReady}
            menuMaxRows={10}
          />
        </Box>
      </Box>

      <AiTrainingSourceMethodPanel
        variant="assistant"
        sourceType={sourceType}
        onSourceTypeChange={onSourceTypeChange}
        sourceRef={sourceRef}
        onSourceRefChange={onSourceRefChange}
        title={title}
        onTitleChange={onTitleChange}
        uploadFile={uploadFile}
        onUploadFileChange={onUploadFileChange}
        registeredWebsiteUrl={registeredUrl}
        createBusy={createBusy}
        canSubmit={canSubmit}
        onSubmit={() => void onSubmit()}
        submitLabel={submitLabelForSourceType(sourceType, createBusy)}
        faqRows={faqRows}
        onFaqRowsChange={onFaqRowsChange}
        onFaqCompiledChange={onFaqCompiledChange}
        initialCategory={faqCategoryFocus}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
        <Button type="button" variant="secondary" href={onCancelHref} disabled={createBusy}>
          Cancel
        </Button>
      </Box>
    </DashboardCard>
  );
}
