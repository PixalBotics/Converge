import { apiClient } from "../http/axios-instance";
import type { JsonRecord } from "../types/common.types";

export async function listPlatformLicenseKeys(
  params?: JsonRecord,
): Promise<unknown> {
  const { data } = await apiClient.get("/platform/license-keys", { params });
  return data;
}

export async function generatePlatformLicenseKey(
  body: JsonRecord,
): Promise<unknown> {
  const { data } = await apiClient.post(
    "/platform/license-keys/generate",
    body,
  );
  return data;
}
