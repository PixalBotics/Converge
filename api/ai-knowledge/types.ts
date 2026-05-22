export type KnowledgeSourceStatus = "pending" | "indexed" | "failed";

export type ChatbotSourceType = "URL" | "WEB_CRAWL" | "SITEMAP" | "FAQ";

export type AssistantSourceType = "PDF" | "FAQ" | "DOCX" | "SOP" | "EXCEL";

export type CreateKnowledgeSourceResult = {
  sourceId: string;
  knowledgeScope: "CHATBOT" | "ASSISTANT";
  indexedChunks: number;
  status: KnowledgeSourceStatus;
  errorMessage: string | null;
};

export type KnowledgeSourceListItem = {
  id: string;
  websiteId: string;
  knowledgeScope: string;
  sourceType: string;
  sourceRef: string;
  title: string | null;
  status: KnowledgeSourceStatus;
  lastIndexedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export type ListKnowledgeSourcesResult = {
  items: KnowledgeSourceListItem[];
  total: number;
};

export type ListKnowledgeSourcesParams = {
  websiteId?: string;
  status?: KnowledgeSourceStatus;
  limit?: number;
  offset?: number;
};

export type CreateKnowledgeSourceJsonBody = {
  websiteId?: string;
  sourceType: string;
  sourceRef: string;
  title?: string;
  metadataJson?: string;
};

export type ReindexKnowledgeBody = {
  sourceId?: string;
  websiteId?: string;
  includeFailed?: boolean;
};

export type ReindexBulkResult = {
  count: number;
  results: CreateKnowledgeSourceResult[];
};
