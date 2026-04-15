import { apiClient } from "../http/axios-instance";
import type { JsonRecord } from "../types/common.types";

export async function attendanceCheckIn(body?: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.post(
    "/hrms/attendance/check-in",
    body === undefined ? undefined : body,
  );
  return data;
}

export async function attendanceCheckOut(body?: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.post(
    "/hrms/attendance/check-out",
    body === undefined ? undefined : body,
  );
  return data;
}

export async function getMyAttendance(params?: JsonRecord): Promise<unknown> {
  const { data } = await apiClient.get("/hrms/attendance/me", { params });
  return data;
}

export async function getUserAttendance(
  userId: string,
  params?: JsonRecord,
): Promise<unknown> {
  const { data } = await apiClient.get(
    `/hrms/attendance/users/${encodeURIComponent(userId)}`,
    { params },
  );
  return data;
}
