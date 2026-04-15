import { apiClient } from "../http/axios-instance";
import type { JsonRecord } from "../types/common.types";

export async function listCompanies(params?: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.get("/companies", { params });
  return data;
}

export async function listCompaniesByReseller(
  resellerId: string,
  params?: JsonRecord,
): Promise<unknown> {
  const { data } = await apiClient.get(
    `/companies/by-reseller/${encodeURIComponent(resellerId)}`,
    { params },
  );
  return data;
}

export async function getCompaniesSetupResellers(): Promise<unknown> {
  const { data } = await apiClient.get("/companies/setup/resellers");
  return data;
}

export async function createCompanySetupDraft(body: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.post("/companies/setup/draft", body);
  return data;
}

export async function updateCompanySetupDraft(
  id: string,
  body: JsonRecord,
): Promise<unknown> {
  const { data } = await apiClient.patch(
    `/companies/setup/draft/${encodeURIComponent(id)}`,
    body,
  );
  return data;
}

export async function submitCompanySetupDraft(id: string): Promise<unknown> {
  const { data } = await apiClient.post(
    `/companies/setup/submit/${encodeURIComponent(id)}`,
  );
  return data;
}

export async function getParentCompany(id: string): Promise<unknown> {
  const { data } = await apiClient.get(
    `/companies/parent/${encodeURIComponent(id)}`,
  );
  return data;
}

export async function updateParentCompany(
  id: string,
  body: JsonRecord,
): Promise<unknown> {
  const { data } = await apiClient.patch(
    `/companies/parent/${encodeURIComponent(id)}`,
    body,
  );
  return data;
}

export async function updateCompany(id: string, body: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.patch(
    `/companies/${encodeURIComponent(id)}`,
    body,
  );
  return data;
}

export async function softDeleteCompany(id: string): Promise<unknown> {
  const { data } = await apiClient.delete(
    `/companies/${encodeURIComponent(id)}`,
  );
  return data;
}
