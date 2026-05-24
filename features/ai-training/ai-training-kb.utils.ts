import type { AssistantSourceType, ChatbotSourceType } from "@/api/ai-knowledge/types";
import type { CreateKnowledgeSourceResult } from "@/api/ai-knowledge/types";

export type AiTrainingKbVariant = "assistant" | "chatbot";

export const CHATBOT_SOURCE_TYPE_OPTIONS: { label: string; value: ChatbotSourceType }[] = [
  { label: "Visitor FAQs (paste text)", value: "FAQ" },
  { label: "Single page", value: "URL" },
  { label: "Crawl website", value: "WEB_CRAWL" },
  { label: "Sitemap import", value: "SITEMAP" },
];

export const FAQ_PASTE_EXAMPLE_CHATBOT = `What is your return policy?
Returns accepted within 14 days with receipt.

Q: What are your hours?
A: Monday–Friday 9am–6pm EST.`;

export const FAQ_PASTE_EXAMPLE_ASSISTANT = `Q: How do I reset a customer password?
A: Open CRM → Users → Reset password, then confirm by email.

What is the escalation path for billing disputes?
Route to Billing L2 via the #billing-escalations channel.`;

export const KB_WEB_MAX_PAGES_HINT = 25;

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

export function hostFromWebsiteUrl(url: string): string | null {
  const t = url.trim();
  if (!t) return null;
  try {
    return new URL(t.startsWith("http") ? t : `https://${t}`).hostname;
  } catch {
    return null;
  }
}

export function isWebSourceType(sourceType: string): boolean {
  return sourceType === "URL" || sourceType === "WEB_CRAWL" || sourceType === "SITEMAP";
}

export function sourceTypeHumanLabel(sourceType: string): string {
  const found =
    CHATBOT_SOURCE_TYPE_OPTIONS.find((o) => o.value === sourceType) ??
    ASSISTANT_SOURCE_TYPE_OPTIONS.find((o) => o.value === sourceType);
  return found?.label ?? sourceType;
}

export type AiTrainingSourceCategory = "website" | "faq" | "documents" | "procedures";

export function categoryForSourceType(
  sourceType: string,
  variant: AiTrainingKbVariant,
): AiTrainingSourceCategory {
  if (sourceType === "FAQ") return "faq";
  if (sourceType === "SOP") return "procedures";
  if (isFileUploadSourceType(sourceType)) return "documents";
  if (variant === "chatbot" && isWebSourceType(sourceType)) return "website";
  return "faq";
}

export function sourceCategoriesForVariant(
  variant: AiTrainingKbVariant,
): { id: AiTrainingSourceCategory; label: string; description: string }[] {
  if (variant === "chatbot") {
    return [
      {
        id: "website",
        label: "Website scraping",
        description: "Import pages from your registered site — one page, crawl, or sitemap.",
      },
      {
        id: "faq",
        label: "Visitor FAQs",
        description: "Paste questions and answers the public chatbot should know.",
      },
    ];
  }
  return [
    {
      id: "faq",
      label: "FAQs & policies",
      description: "Text knowledge for agent copilot and internal AI.",
    },
    {
      id: "documents",
      label: "Documents",
      description: "Upload or link PDF, Word, or Excel files.",
    },
    {
      id: "procedures",
      label: "Procedures (SOP)",
      description: "Step-by-step internal workflows.",
    },
  ];
}

export type SourceMethodCard = {
  value: string;
  title: string;
  summary: string;
  bestFor: string;
  flowSteps: string[];
};

export function sourceMethodCardsForCategory(
  category: AiTrainingSourceCategory,
  variant: AiTrainingKbVariant,
  registeredHost: string | null,
): SourceMethodCard[] {
  const host = registeredHost ?? "your-registered-domain.com";

  if (category === "website" && variant === "chatbot") {
    return [
      {
        value: "SITEMAP",
        title: "Sitemap import (recommended)",
        summary: `Read ${host}/sitemap.xml, then scrape listed pages into the knowledge base.`,
        bestFor: "Most of your site is already in a sitemap (typical for Shopify, WordPress, etc.).",
        flowSteps: [
          "You submit the sitemap URL on your registered domain.",
          "We download the XML and collect page URLs (up to 25 pages per job).",
          "Each page is opened, main content is extracted, and split into chunks.",
          "Chunks are embedded and saved — the visitor chatbot can answer from them.",
        ],
      },
      {
        value: "WEB_CRAWL",
        title: "Crawl from a start page",
        summary: `Start at a URL on ${host} and follow internal links (same host, up to ~${KB_WEB_MAX_PAGES_HINT} pages).`,
        bestFor: "No sitemap handy, or you only want a section (e.g. /help or /products).",
        flowSteps: [
          "You provide a starting URL (usually your homepage or a section root).",
          "We fetch the page and discover same-domain links.",
          "Up to 25 pages are visited, content extracted, and chunked.",
          "Everything is indexed for the public widget chatbot.",
        ],
      },
      {
        value: "URL",
        title: "Single page only",
        summary: "Import one specific page (pricing, shipping policy, etc.).",
        bestFor: "One important page, or a quick test before a full sitemap import.",
        flowSteps: [
          "You paste one https URL on your registered domain.",
          "We fetch that page and extract readable text.",
          "Content is chunked and indexed for the chatbot.",
        ],
      },
    ];
  }

  if (category === "faq") {
    return [
      {
        value: "FAQ",
        title: variant === "chatbot" ? "Visitor FAQ text" : "FAQ / policy text",
        summary:
          variant === "chatbot"
            ? "Questions visitors ask — returns, hours, shipping, product basics."
            : "Internal Q&A for agents — policies, product notes, support scripts.",
        bestFor: "Content that is already written as Q&A, not full web pages.",
        flowSteps: [
          "You paste one or more question + answer pairs (see supported formats below).",
          "We parse each pair into structured FAQ chunks.",
          "Each pair is embedded separately so the bot matches the right answer.",
          variant === "chatbot"
            ? "Stored for the public widget only — not mixed with assistant knowledge."
            : "Stored for agent copilot / internal assistant scope.",
        ],
      },
    ];
  }

  if (category === "documents") {
    return [
      {
        value: "PDF",
        title: "PDF document",
        summary: "Upload a file or provide a public PDF URL (max 100 MB).",
        bestFor: "Policies, brochures, manuals.",
        flowSteps: [
          "You upload a PDF or paste a public HTTPS link.",
          "Text is extracted from the document.",
          "Pages/sections are chunked and indexed for the assistant.",
        ],
      },
      {
        value: "DOCX",
        title: "Word document",
        summary: "Upload .docx or link to a public Word file.",
        bestFor: "SOPs and formatted internal docs.",
        flowSteps: [
          "You upload DOCX or provide a public URL.",
          "Document text is extracted and chunked.",
          "Indexed for assistant retrieval.",
        ],
      },
      {
        value: "EXCEL",
        title: "Excel / CSV catalog",
        summary: "Product sheets, price lists, SKU tables.",
        bestFor: "Structured tabular reference data.",
        flowSteps: [
          "You upload .xlsx, .xls, or .csv (or public file URL).",
          "Rows are parsed into searchable chunks.",
          "Indexed for the assistant.",
        ],
      },
    ];
  }

  if (category === "procedures") {
    return [
      {
        value: "SOP",
        title: "Procedure (SOP)",
        summary: "Step-by-step instructions for agents (min. 20 characters).",
        bestFor: "Escalation flows, troubleshooting checklists, internal how-tos.",
        flowSteps: [
          "You paste the full procedure text.",
          "Content is stored as one indexed document for the assistant.",
          "Agents can retrieve it during live chat copilot.",
        ],
      },
    ];
  }

  return [];
}

export function defaultSourceTypeForCategory(
  category: AiTrainingSourceCategory,
  variant: AiTrainingKbVariant,
): string {
  const cards = sourceMethodCardsForCategory(category, variant, null);
  return cards[0]?.value ?? defaultSourceTypeForVariant(variant);
}

export function suggestedSourceRef(
  sourceType: string,
  websiteUrl: string,
): string {
  const host = hostFromWebsiteUrl(websiteUrl);
  if (!host) return "";
  const root = `https://${host}`;
  switch (sourceType) {
    case "SITEMAP":
      return `${root}/sitemap.xml`;
    case "WEB_CRAWL":
      return root;
    case "URL":
      return root;
    default:
      return "";
  }
}

export function sourceInputLabel(sourceType: string): string {
  switch (sourceType) {
    case "FAQ":
      return "FAQ content";
    case "SOP":
      return "Procedure text";
    case "SITEMAP":
      return "Sitemap URL";
    case "WEB_CRAWL":
      return "Start URL (homepage or section)";
    case "URL":
      return "Page URL";
    default:
      return isFileUploadSourceType(sourceType) ? "Document URL (optional if uploading)" : "Source";
  }
}

export function sourceRefHelperText(
  sourceType: string,
  variant: AiTrainingKbVariant,
): string {
  switch (sourceType) {
    case "FAQ":
      return variant === "chatbot"
        ? "Separate blocks per Q&A. Lines ending with ? start a question; Q:/A: and numbered lists also work."
        : "One or more Q&A pairs for agent copilot — not shared with the visitor chatbot.";
    case "SOP":
      return "Paste the full procedure (minimum 20 characters).";
    case "URL":
      return `Must be on your registered website host. We fetch this page, extract text, and index it.`;
    case "WEB_CRAWL":
      return `Same host only. We follow internal links and index up to ~${KB_WEB_MAX_PAGES_HINT} pages — large sites can take about a minute.`;
    case "SITEMAP":
      return `Usually https://your-domain/sitemap.xml. We read listed URLs (up to ${KB_WEB_MAX_PAGES_HINT}) and scrape each page into the knowledge base.`;
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
  return variant === "chatbot" ? "SITEMAP" : "FAQ";
}

export function submitLabelForSourceType(sourceType: string, createBusy: boolean): string {
  if (createBusy) return "Working…";
  switch (sourceType) {
    case "SITEMAP":
      return "Import sitemap & index pages";
    case "WEB_CRAWL":
      return "Start crawl & index";
    case "URL":
      return "Import page & index";
    case "FAQ":
      return "Save FAQs & index";
    case "SOP":
      return "Save procedure & index";
    case "PDF":
    case "DOCX":
    case "EXCEL":
      return "Upload & index document";
    default:
      return "Create & index";
  }
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
