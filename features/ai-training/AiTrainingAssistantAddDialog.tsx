"use client";

import Close from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { Button, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { aiTrainingFilterGridSx } from "./ai-training-ui.styles";
import { AiTrainingSourceMethodPanel } from "./AiTrainingSourceMethodPanel";
import { submitLabelForSourceType } from "./ai-training-kb.utils";
import type { FaqBuilderRow } from "./faq-builder.utils";
import type { AiTrainingSourceCategory } from "./ai-training-kb.utils";
import type { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

export function AiTrainingAssistantAddDialog({
  open,
  onClose,
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
}: {
  open: boolean;
  onClose: () => void;
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
}) {
  const registeredUrl = hierarchy.selectedWebsite?.url ?? "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1, fontWeight: 700 }}>
        Add AI assistant training
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          FAQs, website scrape, PDF, Word, Excel, or SOP text for agent copilot — separate from visitor chatbot.
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
        </Box>
        <Box sx={{ mt: 1.5, mb: 2 }}>
          <SelectField
            label="Website"
            value={hierarchy.websiteId}
            onChange={hierarchy.setWebsiteId}
            options={hierarchy.websiteOptions}
            disabled={!hierarchy.hierarchyReady}
            menuMaxRows={10}
          />
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
          onSubmit={() => void onSubmit().then(onClose)}
          submitLabel={submitLabelForSourceType(sourceType, createBusy)}
          faqRows={faqRows}
          onFaqRowsChange={onFaqRowsChange}
          onFaqCompiledChange={onFaqCompiledChange}
          initialCategory={faqCategoryFocus}
        />
      </DialogContent>
    </Dialog>
  );
}
