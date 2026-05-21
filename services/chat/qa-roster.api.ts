import { apiClient } from "@/api";
import { unwrapChatHttpData } from "./http";

export type QaRosterResponse = {
  websiteId: string;
  userIds: string[];
};

export async function fetchQaWebsiteRoster(websiteId: string): Promise<QaRosterResponse> {
  const { data } = await apiClient.get<unknown>(
    `/chat/qa/websites/${encodeURIComponent(websiteId)}/roster`,
  );
  const raw = unwrapChatHttpData<QaRosterResponse | { userIds?: string[] }>(data);
  const userIds = Array.isArray(raw?.userIds) ? raw.userIds.map(String) : [];
  return { websiteId, userIds };
}

export async function saveQaWebsiteRoster(
  websiteId: string,
  userIds: string[],
): Promise<QaRosterResponse> {
  const { data } = await apiClient.put<unknown>(
    `/chat/qa/websites/${encodeURIComponent(websiteId)}/roster`,
    { userIds },
  );
  const raw = unwrapChatHttpData<QaRosterResponse>(data);
  return {
    websiteId,
    userIds: Array.isArray(raw?.userIds) ? raw.userIds.map(String) : userIds,
  };
}
