import type { AgentVisitorPresentation, ChatMessage } from "./chat.types";

export const QA_REVIEW_STATUSES = ["pending", "in_progress", "completed"] as const;
export type QaReviewStatus = (typeof QA_REVIEW_STATUSES)[number];

export type QaUserLabel = {
  id: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
};

export type QaQueueFilters = {
  status?: QaReviewStatus;
  websiteId?: string;
  departmentId?: string;
  agentId?: string;
  hasTakeover?: boolean;
};

export type QaQueueRow = {
  id: string;
  conversationId: string;
  websiteId: string;
  status: QaReviewStatus;
  assignSource?: string | null;
  overallScore?: number | null;
  createdAt: string;
  completedAt?: string | null;
  conversation?: {
    id: string;
    status?: string;
    startedAt?: string | null;
    endedAt?: string | null;
    routingKey?: string | null;
    website?: {
      id: string;
      name?: string | null;
      childCompany?: { id: string; name?: string | null };
    };
    agent?: QaUserLabel | null;
  };
  assignedQa?: QaUserLabel | null;
};

export type MessageQaAnnotation = {
  id: string;
  conversationId: string;
  messageId: string;
  rating?: number | null;
  tags?: string[] | null;
  comment?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type QaSessionReview = {
  id: string;
  conversationId: string;
  websiteId: string;
  status: QaReviewStatus;
  serviceChannel?: string | null;
  starRating?: number | null;
  failureReason?: string | null;
  overallScore?: number | null;
  summary?: string | null;
  coachingNotes?: string | null;
  checklistJson?: Record<string, unknown> | null;
  assignSource?: string | null;
  slaDueAt?: string | null;
  reviewSlaHours?: number | null;
  createdAt?: string;
  completedAt?: string | null;
  assignedQa?: QaUserLabel | null;
};

export type ChatTimelineSegment = {
  key: string;
  label: string;
  from: string | null;
  to: string | null;
  messageCount: number;
};

export type QaReviewBundle = {
  transcript: {
    conversationId: string;
    messages: ChatMessage[];
    visitor?: Record<string, unknown> | null;
    visitorPresentation?: AgentVisitorPresentation;
    assignments?: unknown[];
    [key: string]: unknown;
  };
  review: QaSessionReview | null;
  annotations: MessageQaAnnotation[];
  segments: {
    takeoverBoundaryAt: string | null;
    segments: ChatTimelineSegment[];
  };
  timeline: {
    assignments?: unknown[];
    transfers?: unknown[];
    takeoverRequests?: unknown[];
    whispers?: unknown[];
    analyticsEvents?: unknown[];
    guestLinks?: unknown[];
  };
};

export type UpsertQaSessionReviewBody = {
  status: QaReviewStatus;
  starRating?: number;
  failureReason?: string;
  overallScore?: number;
  summary?: string;
  coachingNotes?: string;
  checklistJson?: Record<string, unknown>;
};

export type UpsertQaMessageAnnotationBody = {
  rating?: number;
  tags?: string[];
  comment?: string;
};
