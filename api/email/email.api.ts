import { apiClient } from "../http/axios-instance";
import type {
  EmailPreviewData,
  EmailProvider,
  EmailProviderFormSchema,
  EmailTemplateDraft,
  EmailTemplateDraftBody,
  EmailTestBody,
  EmailTestResult,
  PlatformEmailSettings,
  PlatformEmailSettingsBody,
  PlatformMailAssignment,
  PlatformMailAssignmentBody,
  PlatformMailAssignmentListItem,
  ResellerOwnMailListItem,
  ResellerOwnMailSettings,
  ResellerOwnMailSettingsBody,
} from "../types/email.types";
import { unwrapApiData } from "./unwrap-api-data";
import { normalizeMailProviderSettings } from "./normalize-mail-settings";
import {
  normalizePlatformMailAssignment,
} from "./normalize-platform-mail-assignment";

export async function listEmailProviders(): Promise<EmailProvider[]> {
  const { data } = await apiClient.get("/email/providers");
  return unwrapApiData<EmailProvider[]>(data);
}

export async function getEmailProviderFormSchema(providerId: string): Promise<EmailProviderFormSchema> {
  const { data } = await apiClient.get(
    `/email/providers/${encodeURIComponent(providerId)}/form-schema`,
  );
  return unwrapApiData<EmailProviderFormSchema>(data);
}

// —— Platform mail ——
export async function getPlatformEmailSettings(): Promise<PlatformEmailSettings> {
  const { data } = await apiClient.get("/platform/email-settings");
  return normalizeMailProviderSettings(unwrapApiData<unknown>(data));
}

export async function updatePlatformEmailSettings(body: PlatformEmailSettingsBody): Promise<PlatformEmailSettings> {
  const { data } = await apiClient.put("/platform/email-settings", body);
  return normalizeMailProviderSettings(unwrapApiData<unknown>(data));
}

export async function testPlatformEmailSettings(body: EmailTestBody = {}): Promise<EmailTestResult> {
  const { data } = await apiClient.post("/platform/email-settings/test", body);
  return unwrapApiData<EmailTestResult>(data);
}

export async function deletePlatformEmailSettings(): Promise<void> {
  await apiClient.delete("/platform/email-settings");
}

// —— Reseller own mail ——
export async function listResellerOwnMailSettings(): Promise<ResellerOwnMailListItem[]> {
  const { data } = await apiClient.get("/email/reseller-mail-settings");
  return unwrapApiData<ResellerOwnMailListItem[]>(data);
}

export async function getResellerOwnMailSettings(resellerId: string): Promise<ResellerOwnMailSettings> {
  const { data } = await apiClient.get(
    `/resellers/${encodeURIComponent(resellerId)}/email-settings`,
  );
  return normalizeMailProviderSettings(unwrapApiData<unknown>(data));
}

export async function updateResellerOwnMailSettings(
  resellerId: string,
  body: ResellerOwnMailSettingsBody,
): Promise<ResellerOwnMailSettings> {
  const { data } = await apiClient.put(
    `/resellers/${encodeURIComponent(resellerId)}/email-settings`,
    body,
  );
  return normalizeMailProviderSettings(unwrapApiData<unknown>(data));
}

export async function testResellerOwnMailSettings(
  resellerId: string,
  body: EmailTestBody = {},
): Promise<EmailTestResult> {
  const { data } = await apiClient.post(
    `/resellers/${encodeURIComponent(resellerId)}/email-settings/test`,
    body,
  );
  return unwrapApiData<EmailTestResult>(data);
}

export async function deleteResellerOwnMailSettings(resellerId: string): Promise<void> {
  await apiClient.delete(`/resellers/${encodeURIComponent(resellerId)}/email-settings`);
}

// —— Platform mail assignment ——
export async function listPlatformMailAssignments(): Promise<unknown> {
  const { data } = await apiClient.get("/email/platform-mail-assignments");
  return unwrapApiData<unknown>(data);
}

export async function getPlatformMailAssignment(resellerId: string): Promise<PlatformMailAssignment> {
  const { data } = await apiClient.get(
    `/resellers/${encodeURIComponent(resellerId)}/platform-mail-assignment`,
  );
  return normalizePlatformMailAssignment(unwrapApiData<unknown>(data));
}

export async function updatePlatformMailAssignment(
  resellerId: string,
  body: PlatformMailAssignmentBody,
): Promise<PlatformMailAssignment> {
  const { data } = await apiClient.put(
    `/resellers/${encodeURIComponent(resellerId)}/platform-mail-assignment`,
    body,
  );
  return normalizePlatformMailAssignment(unwrapApiData<unknown>(data));
}

export async function deletePlatformMailAssignment(resellerId: string): Promise<void> {
  await apiClient.delete(
    `/resellers/${encodeURIComponent(resellerId)}/platform-mail-assignment`,
  );
}

// —— Templates & branding ——
export async function getResellerEmailTemplatePublished(resellerId: string): Promise<EmailTemplateDraft> {
  const { data } = await apiClient.get(
    `/resellers/${encodeURIComponent(resellerId)}/email-templates/published`,
  );
  return unwrapApiData<EmailTemplateDraft>(data);
}

export async function getResellerEmailTemplateDraft(resellerId: string): Promise<EmailTemplateDraft> {
  const { data } = await apiClient.get(
    `/resellers/${encodeURIComponent(resellerId)}/email-templates/draft`,
  );
  return unwrapApiData<EmailTemplateDraft>(data);
}

export async function updateResellerEmailTemplateDraft(
  resellerId: string,
  body: EmailTemplateDraftBody,
): Promise<EmailTemplateDraft> {
  const { data } = await apiClient.put(
    `/resellers/${encodeURIComponent(resellerId)}/email-templates/draft`,
    body,
  );
  return unwrapApiData<EmailTemplateDraft>(data);
}

export async function publishResellerEmailTemplateDraft(resellerId: string): Promise<EmailTemplateDraft> {
  const { data } = await apiClient.post(
    `/resellers/${encodeURIComponent(resellerId)}/email-templates/draft/publish`,
  );
  return unwrapApiData<EmailTemplateDraft>(data);
}

export async function getResellerEmailTemplateDraftPreview(resellerId: string): Promise<EmailPreviewData> {
  const { data } = await apiClient.get(
    `/resellers/${encodeURIComponent(resellerId)}/email-templates/draft/preview`,
  );
  return unwrapApiData<EmailPreviewData>(data);
}

export async function getResellerEmailTemplatePublishedPreview(
  resellerId: string,
): Promise<EmailPreviewData> {
  const { data } = await apiClient.get(
    `/resellers/${encodeURIComponent(resellerId)}/email-templates/published/preview`,
  );
  return unwrapApiData<EmailPreviewData>(data);
}

export async function uploadResellerEmailLogo(resellerId: string, file: File): Promise<EmailTemplateDraft> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post(
    `/resellers/${encodeURIComponent(resellerId)}/email-branding/logo`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return unwrapApiData<EmailTemplateDraft>(data);
}

export async function deleteResellerEmailLogo(resellerId: string): Promise<EmailTemplateDraft> {
  const { data } = await apiClient.delete(
    `/resellers/${encodeURIComponent(resellerId)}/email-branding/logo`,
  );
  return unwrapApiData<EmailTemplateDraft>(data);
}
