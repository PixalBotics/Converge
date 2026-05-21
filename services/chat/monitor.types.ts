import type { AgentVisitorPresentation } from "./chat.types";

export type MonitorListTab = "live" | "closed";

export interface MonitorListFilters {
  websiteId?: string;
  departmentId?: string;
  poolId?: string;
  status?: string;
}

export interface MonitorScopeSummary {
  kind: "platform" | "parent_company" | "department" | "pool";
  parentCompanyIds?: string[];
  departmentIds?: string[];
  poolIds?: string[];
}

export interface MonitorCapabilities {
  scopes: MonitorScopeSummary[];
  socketRooms: string[];
  permissions: string[];
}

export interface MonitorAgentRef {
  id: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface MonitorConversationRow {
  id: string;
  websiteId: string;
  visitorId: string;
  agentId: string | null;
  status: string;
  routingKey?: string | null;
  serviceChannel?: string | null;
  departmentId?: string | null;
  poolId?: string | null;
  startedAt?: string;
  endedAt?: string | null;
  department?: { id: string; name: string; type?: string } | null;
  pool?: { id: string; name: string } | null;
  agent?: MonitorAgentRef | null;
  visitorPresentation?: AgentVisitorPresentation;
  lastMessage?: Record<string, unknown> | null;
  childCompany?: { id: string; name: string } | null;
  parentCompany?: { id: string; name: string } | null;
}

export interface MonitorTranscriptResponse {
  conversationId: string;
  messages: import("./chat.types").ChatMessage[];
  readOnly: true;
  visitor?: Record<string, unknown>;
  [key: string]: unknown;
}
