export type OperatingChannels = "internal_only" | "external_only" | "both";

export type ServiceScheduleWindow = {
  daysOfWeek: string[];
  daysOfWeekLabels?: string[];
  startTime: string;
  endTime: string;
  crossesMidnight?: boolean;
};

export type ServiceSchedulingTopic = {
  routingKey: string;
  clientLabel: string;
  displayOrder: number;
  isActive: boolean;
  internalDepartmentId: string;
  internalPoolId: string | null;
  externalDepartmentId: string;
  externalPoolId: string | null;
};

export type ServiceSchedulingBundle = {
  websiteId: string;
  parentCompanyId: string;
  operatingChannels: OperatingChannels;
  timezone: string;
  gapPolicy: string;
  internalWindows: ServiceScheduleWindow[];
  externalWindows: ServiceScheduleWindow[];
  topics: ServiceSchedulingTopic[];
  defaultDepartmentId: string | null;
};

export type ServiceSchedulingTopicInput = {
  routingKey: string;
  clientLabel: string;
  internalDepartmentId: string;
  externalDepartmentId: string;
  internalPoolId?: string | null;
  externalPoolId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
};

export type UpsertServiceSchedulingBody = {
  operatingChannels: OperatingChannels;
  timezone: string;
  gapPolicy: string;
  internalWindows?: Array<{
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    crossesMidnight?: boolean;
  }>;
  externalWindows?: Array<{
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    crossesMidnight?: boolean;
  }>;
  topics: ServiceSchedulingTopicInput[];
  defaultDepartmentId?: string | null;
};
