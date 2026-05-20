import type { WebsiteAssignmentsWebsitesParams } from "./hooks";

/** Build `/website-assignments/websites` query — omits `resellerId` when session is tenant-scoped. */
export function buildWebsitesInScopeParams(input: {
  canFilterByResellerId: boolean;
  all?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  assigned?: boolean;
  resellerId?: string;
  parentCompanyId?: string;
  childCompanyId?: string;
  userId?: string;
}): WebsiteAssignmentsWebsitesParams {
  const params: WebsiteAssignmentsWebsitesParams = {};
  if (input.all) params.all = true;
  if (input.page != null) params.page = input.page;
  if (input.limit != null) params.limit = input.limit;
  const q = input.search?.trim();
  if (q) params.search = q;
  if (input.assigned !== undefined) params.assigned = input.assigned;
  if (input.canFilterByResellerId && input.resellerId?.trim()) {
    params.resellerId = input.resellerId.trim();
  }
  if (input.parentCompanyId?.trim()) params.parentCompanyId = input.parentCompanyId.trim();
  if (input.childCompanyId?.trim()) params.childCompanyId = input.childCompanyId.trim();
  const uid = input.userId?.trim();
  if (uid) params.userId = uid;
  return params;
}
