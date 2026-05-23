export type ChatDepartmentType = "Internal" | "External";

export type ServiceScheduleChannel = "Internal" | "External";

export interface ServiceScheduleWindow {
  channel: ServiceScheduleChannel;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  crossesMidnight?: boolean;
}

export interface ServiceSchedule {
  timezone: string;
  gapPolicy: string;
  windows: ServiceScheduleWindow[];
  /** Enriched on GET — optional labels for weekday chips. */
  daysOfWeekLabels?: Record<string, string>;
}

export interface ChatOperationsJson {
  guestAccess?: Record<string, unknown>;
  takeover?: Record<string, unknown>;
  qa?: Record<string, unknown>;
  sessionResume?: Record<string, unknown>;
  assignment?: Record<string, unknown>;
  reporting?: Record<string, unknown>;
  csat?: Record<string, unknown>;
  cannedResponses?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ChatSettingsDepartmentRef {
  id: string;
  name: string;
}

export interface WebsiteChatSettingsRow {
  id?: string;
  defaultDepartmentId: string | null;
  defaultDepartment: ChatSettingsDepartmentRef | null;
  operationsJson: ChatOperationsJson;
}

export interface ChatRoutingRule {
  id: string;
  routingKey: string;
  departmentType: ChatDepartmentType | string;
  clientLabel: string;
  departmentId: string;
  poolId?: string | null;
  displayOrder: number;
  isActive: boolean;
  department?: ChatSettingsDepartmentRef | null;
  pool?: { id: string; name: string } | null;
}

export interface DepartmentNotifyEmailRow {
  id?: string;
  websiteId?: string;
  departmentId: string;
  email: string;
  label?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
  department?: ChatSettingsDepartmentRef | null;
}

export interface CannedResponseRow {
  id: string;
  websiteId: string;
  departmentId: string;
  title: string;
  body: string;
  sortOrder: number;
}

export interface WebsiteChatSettingsBundle {
  websiteId: string;
  parentCompanyId: string;
  settings: WebsiteChatSettingsRow;
  routes: ChatRoutingRule[];
  departmentNotifyEmails: DepartmentNotifyEmailRow[];
  cannedResponses: CannedResponseRow[];
}

export interface UpsertWebsiteChatSettingsBody {
  defaultDepartmentId?: string | null;
  operationsJson?: Partial<ChatOperationsJson>;
}

export interface UpsertChatRouteBody {
  routingKey: string;
  departmentType?: ChatDepartmentType;
  clientLabel: string;
  departmentId: string;
  poolId?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface PatchChatRouteBody extends Partial<UpsertChatRouteBody> {}

export interface ReplaceDepartmentNotifyEmailsBody {
  items: Array<{
    departmentId: string;
    email: string;
    label?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
}

export interface ReplaceCannedResponsesBody {
  departmentId: string;
  items: Array<{ title: string; body: string; sortOrder?: number }>;
}
