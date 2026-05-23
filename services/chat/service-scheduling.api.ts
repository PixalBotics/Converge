import { apiClient } from "@/api";
import { unwrapChatHttpData } from "./http";
import type {
  ServiceSchedulingBundle,
  UpsertServiceSchedulingBody,
} from "./service-scheduling.types";

function serviceSchedulingPath(websiteId: string): string {
  return `/chat/settings/websites/${encodeURIComponent(websiteId)}/service-scheduling`;
}

export async function fetchServiceScheduling(
  websiteId: string,
): Promise<ServiceSchedulingBundle> {
  const { data } = await apiClient.get<unknown>(serviceSchedulingPath(websiteId));
  return unwrapChatHttpData<ServiceSchedulingBundle>(data);
}

export async function saveServiceScheduling(
  websiteId: string,
  body: UpsertServiceSchedulingBody,
): Promise<ServiceSchedulingBundle> {
  const { data } = await apiClient.put<unknown>(serviceSchedulingPath(websiteId), body);
  return unwrapChatHttpData<ServiceSchedulingBundle>(data);
}

export async function deleteServiceScheduling(
  websiteId: string,
): Promise<ServiceSchedulingBundle> {
  const { data } = await apiClient.delete<unknown>(serviceSchedulingPath(websiteId));
  return unwrapChatHttpData<ServiceSchedulingBundle>(data);
}
