export type ChatReportQuery = {
  from?: string;
  to?: string;
  websiteId?: string;
  departmentId?: string;
};

export type ChatReportMetricBucket = {
  key: string;
  label: string;
  conversationCount: number;
  closedCount: number;
  avgFirstResponseSeconds: number | null;
  avgQueueSeconds: number | null;
  avgHandleSeconds: number | null;
  avgQaScore: number | null;
  avgCsatScore: number | null;
  takeoverCount: number;
};

export type ChatReportOverview = {
  range: { from: string; to: string };
  capped: boolean;
  summary: {
    conversationCount: number;
    closedCount: number;
    takeoverCount: number;
    avgFirstResponseSeconds: number | null;
    avgQueueSeconds: number | null;
    avgHandleSeconds: number | null;
    avgQaScore: number | null;
    avgCsatScore: number | null;
  };
  qa: {
    pending: number;
    inProgress: number;
    completed: number;
    avgOverallScore: number | null;
  };
  byDepartment: ChatReportMetricBucket[];
  byRoutingKey: ChatReportMetricBucket[];
  byAgent: ChatReportMetricBucket[];
};
