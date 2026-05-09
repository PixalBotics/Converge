import { apiClient } from "../http/axios-instance";

export type KbSourceType = "FAQ" | "URL" | "PDF" | "WEB_CRAWL" | "SITEMAP" | string;

export interface UploadKbSourceParams {
  websiteId: string;
  sourceType: KbSourceType;
  sourceRef: string;
  title: string;
  metadataJson: string;
  /** File attachment when required by source type (e.g. PDF). */
  file?: Blob | File | null;
}

export async function postKbSourceMultipart(
  params: UploadKbSourceParams,
): Promise<unknown> {
  const formData = new FormData();
  formData.append("websiteId", params.websiteId);
  formData.append("sourceType", params.sourceType);
  formData.append("sourceRef", params.sourceRef);
  formData.append("title", params.title);
  formData.append("metadataJson", params.metadataJson ?? "{}");

  if (params.file instanceof Blob) {
    formData.append("file", params.file);
  }

  const { data } = await apiClient.post<unknown>("/kb/sources", formData);
  return data;
}

export interface KbReindexBody {
  sourceId: string;
  includeFailed: boolean;
}

export async function postKbReindex(body: KbReindexBody): Promise<unknown> {
  const { data } = await apiClient.post("/kb/reindex", body);
  return data;
}
