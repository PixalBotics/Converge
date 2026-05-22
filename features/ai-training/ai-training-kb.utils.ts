import type { AssistantSourceType, ChatbotSourceType } from "@/api/ai-knowledge/types";
import type { CreateKnowledgeSourceResult } from "@/api/ai-knowledge/types";

export type AiTrainingKbVariant = "assistant" | "chatbot";

export const CHATBOT_SOURCE_TYPE_OPTIONS: { label: string; value: ChatbotSourceType }[] = [
  { label: "FAQ / policy text", value: "FAQ" },
  { label: "Single page URL", value: "URL" },
  { label: "Web crawl (start URL)", value: "WEB_CRAWL" },
  { label: "Sitemap XML URL", value: "SITEMAP" },
];

export const ASSISTANT_SOURCE_TYPE_OPTIONS: { label: string; value: AssistantSourceType }[] = [
  { label: "FAQ / policy text", value: "FAQ" },
  { label: "Excel Sheet File", value: "EXCEL" },
  { label: "PDF document", value: "PDF" },
  { label: "Word document (DOCX)", value: "DOCX" },
  { label: "SOP / procedure text", value: "SOP" },
];

export const ASSISTANT_PDF_ACCEPT = "application/pdf,.pdf";
export const ASSISTANT_DOCX_ACCEPT =
  ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const ASSISTANT_EXCEL_ACCEPT =
  ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv";

export function assistantFileAcceptForSourceType(sourceType: string): string {
  if (sourceType === "DOCX") return ASSISTANT_DOCX_ACCEPT;
  if (sourceType === "EXCEL") return ASSISTANT_EXCEL_ACCEPT;
  return ASSISTANT_PDF_ACCEPT;
}

export function assistantFileUploadButtonLabel(sourceType: string): string {
  if (sourceType === "DOCX") return "Choose DOCX file";
  if (sourceType === "EXCEL") return "Choose Excel file";
  return "Choose PDF file";
}

export function sourceRefHelperText(
  sourceType: string,
  variant: AiTrainingKbVariant,
): string {
  switch (sourceType) {
    case "FAQ":
      return variant === "chatbot"
        ? "Paste visitor-facing FAQs (Q&A text). Indexed under CHATBOT scope for the public widget — separate from assistant FAQs."
        : "Paste full FAQ or Q&A body. Indexed under ASSISTANT scope for agent copilot retrieval.";
    case "SOP":
      return "Paste procedure steps (minimum 20 characters). Used for internal assistant workflows.";
    case "URL":
      return "Full https URL of one page; HTML is fetched and chunked for the chatbot.";
    case "WEB_CRAWL":
      return "Site entry URL. Backend crawls same-host links (~25 pages cap).";
    case "SITEMAP":
      return "Sitemap XML URL. Listed pages are ingested for the chatbot.";
    case "PDF":
      return variant === "assistant"
        ? "Public PDF URL, or upload a file below (max 100 MB)."
        : "PDF is not allowed on the chatbot API.";
    case "DOCX":
      return "Public .docx URL, or upload a Word file below (max 100 MB).";
    case "EXCEL":
      return "Upload a workbook (.xlsx, .xls, .csv) or paste a public HTTPS URL to the file (max 100 MB).";
    default:
      return "Value depends on source type.";
  }
}

export function isValidOptionalMetadataJson(raw: string): boolean {
  const t = raw.trim();
  if (!t) return true;
  try {
    JSON.parse(t);
    return true;
  } catch {
    return false;
  }
}

export function defaultSourceTypeForVariant(variant: AiTrainingKbVariant): string {
  return variant === "chatbot" ? "URL" : "FAQ";
}

export function sourceTypeOptionsForVariant(variant: AiTrainingKbVariant) {
  return variant === "chatbot" ? CHATBOT_SOURCE_TYPE_OPTIONS : ASSISTANT_SOURCE_TYPE_OPTIONS;
}

export function isTextSourceType(sourceType: string): boolean {
  return sourceType === "FAQ" || sourceType === "SOP";
}

export function isFileUploadSourceType(sourceType: string): boolean {
  return sourceType === "PDF" || sourceType === "DOCX" || sourceType === "EXCEL";
}

export function formatSourceRefForDisplay(item: {
  sourceRef: string;
  title: string | null;
  sourceType: string;
}): string {
  const title = (item.title ?? "").trim();
  const ref = (item.sourceRef ?? "").trim();
  if (title) return title;
  if (ref.startsWith("kb-upload") || ref.startsWith("kb-upload-docx:")) {
    return "Uploaded file";
  }
  if (ref.length > 80) return `${ref.slice(0, 77)}…`;
  return ref || "—";
}

export function isReindexBulkResult(
  payload: CreateKnowledgeSourceResult | { count?: number; results?: unknown[] },
): payload is { count: number; results: CreateKnowledgeSourceResult[] } {
  return typeof (payload as { count?: number }).count === "number";
}

export function toastMessageForCreateResult(result: CreateKnowledgeSourceResult): {
  variant: "success" | "error";
  message: string;
} {
  if (result.status === "failed") {
    return {
      variant: "error",
      message: result.errorMessage?.trim() || "Indexing failed. Check the source list for details.",
    };
  }
  const chunks = result.indexedChunks ?? 0;
  return {
    variant: "success",
    message:
      result.status === "indexed"
        ? `Source indexed successfully (${chunks} chunk${chunks === 1 ? "" : "s"}).`
        : "Source created. Indexing may still be in progress.",
  };
}
