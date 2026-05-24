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
  chunkCount?: number;
};

export type KnowledgeChunkPreviewItem = {
  id: string;
  chunkIndex: number;
  chunkType: string | null;
  contentPreview: string;
  tokenCount: number | null;
  pageUrl: string | null;
  pageTitle: string | null;
  faqQuestion: string | null;
  faqAnswer: string | null;
};

export type ListKnowledgeSourceChunksParams = {
  limit?: number;
  offset?: number;
};

export type ListKnowledgeSourceChunksResult = {
  source: KnowledgeSourceListItem;
  items: KnowledgeChunkPreviewItem[];
  total: number;
};

export type KbTrainingWebsiteSummary = {
  websiteId: string;
  name: string;
  url: string;
  childCompanyId: string;
  childCompanyName: string;
  parentCompanyId: string;
  parentCompanyName: string;
  resellerId: string;
  sourceCount: number;
  indexedSourceCount: number;
  failedSourceCount: number;
  pendingSourceCount: number;
  totalChunks: number;
  lastIndexedAt: string | null;
  isTrained: boolean;
  sourceTypes: string[];
};

export type ListKbTrainingWebsitesParams = {
  resellerId?: string;
  parentCompanyId?: string;
  childCompanyId?: string;
  trainedOnly?: boolean;
  limit?: number;
  offset?: number;
};

export type ListKbTrainingWebsitesResult = {
  items: KbTrainingWebsiteSummary[];
  total: number;
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
