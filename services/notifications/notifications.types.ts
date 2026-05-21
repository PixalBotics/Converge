export type NotificationBadgeGroup = "chat" | "qa" | "hrms_leave";

export type NotificationSoundKey = "chat" | "qa" | "hrms_leave";

export type NotificationDto = {
  id: string;
  type: string;
  badgeGroup: NotificationBadgeGroup;
  soundKey?: NotificationSoundKey | null;
  title: string;
  body?: string | null;
  href?: string | null;
  payload?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
};

export type BadgeCounts = {
  chat: number;
  qa: number;
  hrms_leave: number;
};

export type NotificationSocketEvent = {
  event: "new" | "read" | "read_all";
  notification?: NotificationDto;
  badgeCounts: BadgeCounts;
};

export type NotificationsListResponse = {
  items: NotificationDto[];
};
