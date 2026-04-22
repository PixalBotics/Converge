import { apiClient } from "../http/axios-instance";
import type { JsonRecord } from "../types/common.types";

/** Cross-pool listing (optional filters). Omit poolId to list members in scope. */
export async function listHrmsPoolMembers(params?: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.get("/hrms/pool-members", { params });
  return data;
}

export async function listPoolMembers(
  poolId: string,
  params?: JsonRecord,
): Promise<unknown> {
  const { data } = await apiClient.get(
    `/hrms/pools/${encodeURIComponent(poolId)}/members`,
    { params },
  );
  return data;
}

export async function addPoolMember(poolId: string, body: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.post(
    `/hrms/pools/${encodeURIComponent(poolId)}/members`,
    body,
  );
  return data;
}

export async function getPoolMember(poolId: string, userId: string): Promise<unknown> {
  const { data } = await apiClient.get(
    `/hrms/pools/${encodeURIComponent(poolId)}/members/${encodeURIComponent(userId)}`,
  );
  return data;
}

export async function movePoolMember(
  poolId: string,
  userId: string,
  body: JsonRecord,
): Promise<unknown> {
  const { data } = await apiClient.patch(
    `/hrms/pools/${encodeURIComponent(poolId)}/members/${encodeURIComponent(userId)}`,
    body,
  );
  return data;
}

export async function removePoolMember(poolId: string, userId: string): Promise<unknown> {
  const { data } = await apiClient.delete(
    `/hrms/pools/${encodeURIComponent(poolId)}/members/${encodeURIComponent(userId)}`,
  );
  return data;
}
