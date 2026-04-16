import { apiClient } from "../http/axios-instance";
import type { JsonRecord } from "../types/common.types";
import type { WebsiteAssignmentsWebsitesResponseEnvelope } from "../types/website-assignments.types";

export async function listWebsitesInScope(
  params?: JsonRecord,
): Promise<WebsiteAssignmentsWebsitesResponseEnvelope> {
  const { data } = await apiClient.get<WebsiteAssignmentsWebsitesResponseEnvelope>(
    "/website-assignments/websites",
    {
    params,
    },
  );
  return data;
}

export async function getWebsiteAssignmentDetail(
  websiteId: string,
): Promise<unknown> {
  const { data } = await apiClient.get(
    `/website-assignments/websites/${encodeURIComponent(websiteId)}`,
  );
  return data;
}

export async function listWebsitesForUser(
  userId: string,
  params?: JsonRecord,
): Promise<unknown> {
  const { data } = await apiClient.get(
    `/website-assignments/users/${encodeURIComponent(userId)}/websites`,
    { params },
  );
  return data;
}

export async function assignWebsiteTier(body: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.post("/website-assignments", body);
  return data;
}

export async function removeWebsiteTierAssignment(
  websiteId: string,
  assignmentType: string,
): Promise<unknown> {
  const { data } = await apiClient.delete(
    `/website-assignments/websites/${encodeURIComponent(websiteId)}/${encodeURIComponent(assignmentType)}`,
  );
  return data;
}
