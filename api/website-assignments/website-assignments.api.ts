import { apiClient } from "../http/axios-instance";
import type { JsonRecord } from "../types/common.types";
import type {
  AssignWebsiteTierBody,
  WebsiteAssignmentUserWebsitesEnvelope,
  WebsiteAssignmentWebsiteDetailEnvelope,
  WebsiteAssignmentsWebsitesResponseEnvelope,
} from "../types/website-assignments.types";

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
): Promise<WebsiteAssignmentWebsiteDetailEnvelope> {
  const { data } = await apiClient.get<WebsiteAssignmentWebsiteDetailEnvelope>(
    `/website-assignments/websites/${encodeURIComponent(websiteId)}`,
  );
  return data;
}

export async function listWebsitesForUser(
  userId: string,
  params?: JsonRecord,
): Promise<WebsiteAssignmentUserWebsitesEnvelope> {
  const { data } = await apiClient.get<WebsiteAssignmentUserWebsitesEnvelope>(
    `/website-assignments/users/${encodeURIComponent(userId)}/websites`,
    { params },
  );
  return data;
}

export async function assignWebsiteTier(body: AssignWebsiteTierBody): Promise<unknown> {
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
