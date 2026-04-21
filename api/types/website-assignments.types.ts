import type { ApiEnvelope } from "./auth.types";
import type { JsonRecord } from "./common.types";

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

/** `GET /website-assignments/websites/:websiteId` — shape varies; use payload helpers on the client. */
export type WebsiteAssignmentWebsiteDetailEnvelope = ApiEnvelope<JsonRecord>;

/** `GET /website-assignments/users/:userId/websites` — often same list envelope as scope websites. */
export type WebsiteAssignmentUserWebsitesEnvelope = ApiEnvelope<JsonRecord>;

/** `POST /website-assignments` — at most one agent per tier per website. */
export type WebsiteAssignmentTier = "Primary" | "Secondary" | "Backup";

export interface AssignWebsiteTierBody {
  websiteId: string;
  userId: string;
  assignmentType: WebsiteAssignmentTier;
}
