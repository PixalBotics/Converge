import type { ApiEnvelope } from "./auth.types";
import type { JsonRecord } from "./common.types";
import type { ShiftCoverage } from "./shift-coverage.types";

export type OperatingChannels = "internal_only" | "external_only" | "both";
export type ServiceChannel = "Internal" | "External";
export type WebsiteAssignmentTier = "Primary" | "Secondary" | "Backup";

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
  filledSlots?: number;
  uniqueMemberCount?: number;
  expectedRosterSlots?: number;
  serviceSchedulingConfigured?: boolean;
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

export interface WebsiteAssignmentSlotUser {
  userId: string;
  name: string;
  email: string;
  userType?: string;
}

export interface WebsiteAssignmentChannelRoster {
  primary: WebsiteAssignmentSlotUser | null;
  secondary: WebsiteAssignmentSlotUser | null;
  backup: WebsiteAssignmentSlotUser | null;
}

export interface WebsiteDepartmentRosterRow {
  departmentId: string;
  departmentName: string;
  departmentType: string;
  roster: {
    internal: WebsiteAssignmentChannelRoster;
    external: WebsiteAssignmentChannelRoster;
  };
}

export interface WebsiteAssignmentDetail {
  websiteId: string;
  url: string;
  name: string;
  operatingChannels: OperatingChannels;
  allowedAssignmentChannels: ServiceChannel[];
  serviceSchedulingConfigured?: boolean;
  departmentRoster: WebsiteDepartmentRosterRow[];
  assignments?: unknown[];
  parentCompanyId?: string;
  parentCompanyName?: string;
  childCompanyId?: string;
  childCompanyName?: string;
  resellerId?: string;
  resellerName?: string;
}

export type WebsiteAssignmentWebsiteDetailEnvelope = ApiEnvelope<WebsiteAssignmentDetail>;

export type WebsiteAssignmentUserWebsitesEnvelope = ApiEnvelope<JsonRecord>;

export interface AssignWebsiteTierBody {
  websiteId: string;
  departmentId: string;
  serviceChannel: ServiceChannel;
  userId: string;
  assignmentType: WebsiteAssignmentTier;
}

export interface AssignWebsiteTierResponse {
  shiftCoverage?: ShiftCoverage;
  [key: string]: unknown;
}

/** PUT …/departments/:departmentId/roster — null tier value clears slot. */
export interface ChannelRosterSlotsBody {
  Primary?: string | null;
  Secondary?: string | null;
  Backup?: string | null;
}

export interface PutDepartmentRosterBody {
  internal?: ChannelRosterSlotsBody;
  external?: ChannelRosterSlotsBody;
}

export type PutDepartmentRosterResponseEnvelope = ApiEnvelope<
  WebsiteAssignmentDetail & { shiftCoverage?: ShiftCoverage }
>;
