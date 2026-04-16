import type { ApiEnvelope } from "./auth.types";

export interface WebsiteAssignmentScopeItem {
  websiteId: string;
  url: string;
  name: string;
  childCompanyId: string;
  childCompanyName: string;
  parentCompanyId: string;
  parentCompanyName: string;
  resellerId: string;
  resellerName: string;
  assignedCount: number;
  isFullyAssigned: boolean;
  assignments: unknown[];
}

export interface WebsiteAssignmentsWebsitesData {
  items: WebsiteAssignmentScopeItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type WebsiteAssignmentsWebsitesResponseEnvelope =
  ApiEnvelope<WebsiteAssignmentsWebsitesData>;
