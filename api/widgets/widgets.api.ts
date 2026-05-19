import { apiClient } from "../http/axios-instance";
import type { ApiEnvelope } from "../types/auth.types";
import type { JsonRecord } from "../types/common.types";
import type {
  ListWidgetsQuery,
  WidgetAssetUploadEnvelope,
  WidgetEmbedSnippetEnvelope,
  WidgetInstallationResponseEnvelope,
  WidgetListResponseEnvelope,
} from "../types/widgets.types";

function unwrapData<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export async function listAdminWidgets(
  params?: ListWidgetsQuery,
): Promise<WidgetListResponseEnvelope> {
  const { data } = await apiClient.get<WidgetListResponseEnvelope>("/widgets", {
    params: params as Record<string, unknown>,
  });
  return data;
}

/** `POST /widgets/installations` — InstallTokenDto body (JSON shape varies; build server-side aligned payloads). */
export async function createWidgetInstallation(
  body: JsonRecord,
): Promise<WidgetInstallationResponseEnvelope> {
  const { data } = await apiClient.post<WidgetInstallationResponseEnvelope>(
    "/widgets/installations",
    body,
  );
  return data;
}

export async function getWidgetEmbedSnippet(
  widgetKey: string,
): Promise<WidgetEmbedSnippetEnvelope> {
  const { data } = await apiClient.get<WidgetEmbedSnippetEnvelope>(
    `/widgets/${encodeURIComponent(widgetKey)}/embed-snippet`,
  );
  return data;
}

export async function getWidgetSnapshot(
  widgetKey: string,
): Promise<ApiEnvelope<JsonRecord>> {
  const { data } = await apiClient.get<ApiEnvelope<JsonRecord>>(
    `/widgets/${encodeURIComponent(widgetKey)}/snapshot`,
  );
  return data;
}

export async function getAdminWidget(
  widgetKey: string,
): Promise<ApiEnvelope<JsonRecord>> {
  const { data } = await apiClient.get<ApiEnvelope<JsonRecord>>(
    `/widgets/${encodeURIComponent(widgetKey)}`,
  );
  return data;
}

/** Update draft (+ optional publish when publishNow: true). */
export async function patchWidgetConfiguration(
  widgetKey: string,
  body: JsonRecord,
): Promise<ApiEnvelope<JsonRecord>> {
  const { data } = await apiClient.patch<ApiEnvelope<JsonRecord>>(
    `/widgets/${encodeURIComponent(widgetKey)}`,
    body,
  );
  return data;
}

/** Soft-delete widget configuration (sets deletedAt; website row kept). */
export async function deleteWidget(widgetKey: string): Promise<void> {
  await apiClient.delete(`/widgets/${encodeURIComponent(widgetKey)}`);
}

export async function publishWidget(
  widgetKey: string,
  body?: JsonRecord,
): Promise<ApiEnvelope<JsonRecord>> {
  const { data } = await apiClient.post<ApiEnvelope<JsonRecord>>(
    `/widgets/${encodeURIComponent(widgetKey)}/publish`,
    body ?? {},
  );
  return data;
}

export async function rollbackWidget(
  widgetKey: string,
  body: JsonRecord,
): Promise<ApiEnvelope<JsonRecord>> {
  const { data } = await apiClient.post<ApiEnvelope<JsonRecord>>(
    `/widgets/${encodeURIComponent(widgetKey)}/rollback`,
    body,
  );
  return data;
}

export async function uploadWidgetAsset(params: {
  websiteId: string;
  assetType: "button_icon" | "banner_image" | "banner_video" | "background_image";
  file: File;
}): Promise<JsonRecord> {
  const form = new FormData();
  form.append("websiteId", params.websiteId);
  form.append("assetType", params.assetType);
  form.append("file", params.file);

  const { data } = await apiClient.post<
    WidgetAssetUploadEnvelope | JsonRecord
  >("/widgets/assets/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return unwrapData<JsonRecord>(data);
}

/** Extract inner data from envelopes or return root. */
export function widgetResponseData<T>(payload: unknown): T {
  return unwrapData<T>(payload);
}
