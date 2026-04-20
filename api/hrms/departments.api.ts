import { apiClient } from "../http/axios-instance";
import type { JsonRecord } from "../types/common.types";

export async function listDepartments(params?: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.get("/hrms/departments", { params });
  return data;
}

export async function getDepartment(id: string): Promise<unknown> {
  const { data } = await apiClient.get(`/hrms/departments/${encodeURIComponent(id)}`);
  return data;
}

export async function createDepartment(body: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.post("/hrms/departments", body);
  return data;
}

export async function updateDepartment(
  id: string,
  body: JsonRecord,
): Promise<unknown> {
  const { data } = await apiClient.patch(
    `/hrms/departments/${encodeURIComponent(id)}`,
    body,
  );
  return data;
}

export async function softDeleteDepartment(id: string): Promise<unknown> {
  const { data } = await apiClient.delete(
    `/hrms/departments/${encodeURIComponent(id)}`,
  );
  return data;
}
