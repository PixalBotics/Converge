import { apiClient } from "./http/axios-instance";
import type { JsonRecord } from "./types/common.types";

function widgetBase(widgetId: string): string {
  return `/chat/widget/admin/widgets/${encodeURIComponent(widgetId)}`;
}

/** Live / published widget configuration. */
export async function getWidgetPublishedConfig(widgetId: string): Promise<unknown> {
  const { data } = await apiClient.get(`${widgetBase(widgetId)}/published`);
  return data;
}

/** Editable draft (may match published until edited). */
export async function getWidgetDraftConfig(widgetId: string): Promise<unknown> {
  const { data } = await apiClient.get(`${widgetBase(widgetId)}/draft`);
  return data;
}

export async function patchWidgetDraftConfig(widgetId: string, body: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.patch(`${widgetBase(widgetId)}/draft`, body);
  return data;
}

export async function publishWidgetDraft(widgetId: string): Promise<unknown> {
  const { data } = await apiClient.post(`${widgetBase(widgetId)}/publish`);
  return data;
}

export async function rollbackWidgetPublished(widgetId: string): Promise<unknown> {
  const { data } = await apiClient.post(`${widgetBase(widgetId)}/rollback`);
  return data;
}

/** Multipart logo upload; returns envelope or `{ url }` depending on backend. */
export async function uploadWidgetLogo(widgetId: string, file: File): Promise<unknown> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post(`${widgetBase(widgetId)}/assets/logo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
