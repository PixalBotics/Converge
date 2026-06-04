import { apiClient } from "@/api/http/axios-instance";
import { chatAuthHeaders, unwrapChatHttpData } from "./http";
import type {
  GuestLinkRow,
  GuestLinkSendTarget,
  SendDepartmentGuestLinkBody,
  SendDepartmentGuestLinkResponse,
} from "./guest.types";

export async function getGuestLinkSendTarget(
  conversationId: string,
  token?: string,
): Promise<GuestLinkSendTarget> {
  const { data } = await apiClient.get<unknown>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/guest-link-target`,
    { headers: chatAuthHeaders(token) },
  );
  return unwrapChatHttpData<GuestLinkSendTarget>(data);
}

export async function sendDepartmentGuestLink(
  conversationId: string,
  body: SendDepartmentGuestLinkBody | undefined,
  token?: string,
): Promise<SendDepartmentGuestLinkResponse> {
  const { data } = await apiClient.post<unknown>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/send-department-link`,
    body ?? {},
    { headers: chatAuthHeaders(token) },
  );
  return unwrapChatHttpData<SendDepartmentGuestLinkResponse>(data);
}

export async function listConversationGuestLinks(
  conversationId: string,
  token?: string,
): Promise<GuestLinkRow[]> {
  const { data } = await apiClient.get<unknown>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/guest-links`,
    { headers: chatAuthHeaders(token) },
  );
  const unwrapped = unwrapChatHttpData<unknown>(data);
  return Array.isArray(unwrapped) ? (unwrapped as GuestLinkRow[]) : [];
}
