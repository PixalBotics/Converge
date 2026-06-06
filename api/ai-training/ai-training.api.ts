import { apiClient } from "../http/axios-instance";
import { unwrapAiKnowledgeData } from "../ai-knowledge/unwrap";

export type WebsiteAiBehavior = {
  confidenceThreshold: number | null;
  strictKbOnly: boolean;
  greetingMessage: string | null;
  noMatchMessage: string | null;
  lowConfidenceMessage: string | null;
  llmErrorMessage: string | null;
  escalationMessage: string | null;
  partialMatchMessage: string | null;
};

export type AiTrainingTestContext = {
  websiteId: string;
  websiteName: string | null;
  websiteUrl: string;
  widgetKey: string | null;
  defaultAiBehavior: WebsiteAiBehavior;
};

export type AiPipelineStep = {
  id: string;
  label: string;
  detail: string;
  status: "done" | "skipped" | "failed" | "warn";
};

export type AiTrainingKnowledgeMatch = {
  content: string;
  score: number;
  sourceRef?: string;
};

export type AiTrainingTestRespondResult =
  | {
      variant: "chatbot";
      intent?: string;
      response: string;
      replySource?: string;
      knowledgeMatches?: AiTrainingKnowledgeMatch[];
      topKnowledgeMatch?: { content: string; score: number } | null;
      pipeline?: AiPipelineStep[];
    }
  | {
      variant: "assistant";
      action: string;
      output: string | unknown;
      pipeline?: AiPipelineStep[];
    };

export async function fetchAiTrainingBehavior(
  websiteId: string,
): Promise<WebsiteAiBehavior> {
  const { data } = await apiClient.get<unknown>(
    `/ai-training/websites/${encodeURIComponent(websiteId)}/behavior`,
  );
  return unwrapAiKnowledgeData<WebsiteAiBehavior>(data);
}

export async function patchAiTrainingBehavior(
  websiteId: string,
  body: Partial<WebsiteAiBehavior>,
): Promise<WebsiteAiBehavior> {
  const { data } = await apiClient.patch<unknown>(
    `/ai-training/websites/${encodeURIComponent(websiteId)}/behavior`,
    body,
  );
  return unwrapAiKnowledgeData<WebsiteAiBehavior>(data);
}

export async function fetchAiTrainingTestContext(
  websiteId: string,
): Promise<AiTrainingTestContext> {
  const { data } = await apiClient.get<unknown>(
    `/ai-training/websites/${encodeURIComponent(websiteId)}/test-context`,
  );
  return unwrapAiKnowledgeData<AiTrainingTestContext>(data);
}

export async function postAiTrainingTestRespond(body: {
  websiteId: string;
  variant: "chatbot" | "assistant";
  message: string;
  currentPageUrl?: string;
}): Promise<AiTrainingTestRespondResult> {
  const { data } = await apiClient.post<unknown>("/ai-training/test-respond", body);
  return unwrapAiKnowledgeData<AiTrainingTestRespondResult>(data);
}
