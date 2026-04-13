import { apiClient } from "../http/axios-instance";
import type { JsonRecord } from "../types/common.types";

export async function getMyPlatformTheme(): Promise<unknown> {
  const { data } = await apiClient.get("/platform-theme/me");
  return data;
}

export async function updateMyPlatformTheme(body: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.patch("/platform-theme/me", body);
  return data;
}
