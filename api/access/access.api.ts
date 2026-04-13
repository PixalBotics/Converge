import { apiClient } from "../http/axios-instance";
import type { JsonRecord } from "../types/common.types";

export async function getMyEffectivePermissions(): Promise<unknown> {
  const { data } = await apiClient.get("/access/me/effective-permissions");
  return data;
}

export async function listPermissionsCatalog(): Promise<unknown> {
  const { data } = await apiClient.get("/access/permissions/catalog");
  return data;
}

export async function getPermissionApplicability(
  permissionName: string,
): Promise<unknown> {
  const { data } = await apiClient.get(
    `/access/permissions/${encodeURIComponent(permissionName)}/applicability`,
  );
  return data;
}

export async function replacePermissionApplicability(
  permissionName: string,
  body: JsonRecord,
): Promise<unknown> {
  const { data } = await apiClient.put(
    `/access/permissions/${encodeURIComponent(permissionName)}/applicability`,
    body,
  );
  return data;
}
