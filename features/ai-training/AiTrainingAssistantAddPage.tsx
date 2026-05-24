"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AutoStories from "@mui/icons-material/AutoStories";
import LinearProgress from "@mui/material/LinearProgress";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import { useCreateAiAssistantKbSourceMutation } from "@/lib/hooks/query/ai-knowledge";
import { AiTrainingPageShell } from "./AiTrainingPageShell";
import { AiTrainingAssistantAddForm } from "./AiTrainingAssistantAddForm";
import { aiTrainingListHref, aiTrainingManageHref } from "./ai-training-routes";
import {
  compileFaqRowsToSourceRef,
  countValidFaqRows,
  createEmptyFaqRow,
  type FaqBuilderRow,
} from "./faq-builder.utils";
import {
  defaultSourceTypeForVariant,
  isFileUploadSourceType,
  isTextSourceType,
  isWebSourceType,
  suggestedSourceRef,
  toastMessageForCreateResult,
  type AiTrainingSourceCategory,
} from "./ai-training-kb.utils";
import { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

export function AiTrainingAssistantAddPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialWebsiteId = searchParams.get("websiteId") ?? undefined;

  const hierarchy = useAiTrainingHierarchy();
  const createAssistant = useCreateAiAssistantKbSourceMutation();
  const listHref = aiTrainingListHref("assistant");

  const [sourceType, setSourceType] = useState(() => defaultSourceTypeForVariant("assistant"));
  const [sourceRef, setSourceRef] = useState("");
  const [title, setTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [faqRows, setFaqRows] = useState<FaqBuilderRow[]>(() => [createEmptyFaqRow()]);
  const [faqCategoryFocus] = useState<AiTrainingSourceCategory | undefined>();

  const websiteId = hierarchy.websiteId.trim();
  const registeredUrl = hierarchy.selectedWebsite?.url ?? "";

  useEffect(() => {
    if (initialWebsiteId) hierarchy.setWebsiteId(initialWebsiteId);
  }, [initialWebsiteId]);

  useEffect(() => {
    if (!registeredUrl.trim() || !isWebSourceType(sourceType)) return;
    if (!sourceRef.trim()) {
      setSourceRef(suggestedSourceRef(sourceType, registeredUrl));
    }
  }, [websiteId, registeredUrl, sourceType]);

  const canSubmit =
    Boolean(websiteId) &&
    !createAssistant.isPending &&
    (sourceType === "FAQ"
      ? countValidFaqRows(faqRows) > 0
      : isFileUploadSourceType(sourceType) && uploadFile
        ? true
        : isTextSourceType(sourceType)
          ? sourceRef.trim().length >= (sourceType === "SOP" ? 20 : 1)
          : isFileUploadSourceType(sourceType)
            ? Boolean(sourceRef.trim()) || Boolean(uploadFile)
            : Boolean(sourceRef.trim()));

  const submitSource = async () => {
    if (!websiteId) {
      publishAppToast({ variant: "error", message: "Select a website first." });
      return;
    }
    if (sourceType === "SOP" && sourceRef.trim().length < 20) {
      publishAppToast({ variant: "error", message: "SOP text must be at least 20 characters." });
      return;
    }
    const refForSubmit =
      sourceType === "FAQ" ? compileFaqRowsToSourceRef(faqRows) : sourceRef.trim();

    try {
      let result;
      if (isFileUploadSourceType(sourceType) && uploadFile) {
        result = await createAssistant.mutateAsync({
          websiteId,
          sourceType: sourceType as "PDF" | "DOCX" | "EXCEL",
          file: uploadFile,
          title: title.trim() || uploadFile.name,
        });
      } else {
        result = await createAssistant.mutateAsync({
          websiteId,
          sourceType,
          sourceRef: refForSubmit,
          title: title.trim() || undefined,
        });
      }
      const toast = toastMessageForCreateResult(result);
      publishAppToast({ variant: toast.variant, message: toast.message });
      router.push(aiTrainingManageHref("assistant", websiteId));
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Could not create training content.",
      });
    }
  };

  return (
    <AiTrainingPageShell
      title="Add assistant training"
      subtitle="Upload or paste knowledge for agents — separate from the public chatbot."
      icon={<AutoStories sx={{ color: "primary.main", fontSize: 28 }} />}
      backHref={listHref}
      backLabel="All trained websites"
    >
      {createAssistant.isPending ? <LinearProgress sx={{ borderRadius: 1 }} /> : null}
      <AiTrainingAssistantAddForm
        hierarchy={hierarchy}
        sourceType={sourceType}
        onSourceTypeChange={(v) => {
          setSourceType(v);
          setUploadFile(null);
        }}
        sourceRef={sourceRef}
        onSourceRefChange={setSourceRef}
        title={title}
        onTitleChange={setTitle}
        uploadFile={uploadFile}
        onUploadFileChange={setUploadFile}
        faqRows={faqRows}
        onFaqRowsChange={setFaqRows}
        onFaqCompiledChange={setSourceRef}
        faqCategoryFocus={faqCategoryFocus}
        createBusy={createAssistant.isPending}
        canSubmit={canSubmit}
        onSubmit={submitSource}
        onCancelHref={listHref}
      />
    </AiTrainingPageShell>
  );
}
