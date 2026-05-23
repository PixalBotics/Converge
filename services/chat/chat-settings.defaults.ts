import type { ChatOperationsJson, ServiceSchedule } from "./chat-settings.types";

export const DEFAULT_SERVICE_SCHEDULE: ServiceSchedule = {
  timezone: "Asia/Karachi",
  gapPolicy: "queue_until_next_window",
  windows: [
    {
      channel: "Internal",
      daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      startTime: "09:00",
      endTime: "18:00",
      crossesMidnight: false,
    },
    {
      channel: "External",
      daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      startTime: "10:00",
      endTime: "22:00",
      crossesMidnight: false,
    },
  ],
};

/** Mirrors backend `DEFAULT_CHAT_OPERATIONS` — merged on save (unknown keys preserved). */
export const DEFAULT_CHAT_OPERATIONS: ChatOperationsJson = {
  guestAccess: {
    enabled: false,
    sendMode: "agent_manual_only",
    linkExpiresHours: 72,
    guestSessionMinutesAfterOpen: 240,
    urlStrictSingleOpen: true,
    revokePreviousLinksOnNewSend: true,
    permissions: {
      viewTranscript: true,
      viewVisitorPii: true,
      whisper: true,
      takeoverRequest: true,
    },
  },
  takeover: {
    enabled: false,
    requesters: {
      poolHead: true,
      departmentHead: true,
      resellerMonitor: true,
      guestLinkRecipient: true,
    },
    notify: { currentAgent: true, poolHead: true },
    approval: { mode: "current_agent_or_pool_head" },
    whisper: { supervisorSuggestionEnabled: true, agentMustClickSend: true },
  },
  qa: {
    enabled: false,
    autoAssignOnClose: true,
    autoAssignOnTakeover: false,
    notifyAssignedQaOnTakeover: false,
    externalCanSeeWhispers: false,
    assignMode: "least_pending",
    reviewSlaHours: null,
  },
  sessionResume: {
    enabled: true,
    reopenClosedWithinMinutes: 1440,
  },
  assignment: {
    requireHrmsShiftForInternal: false,
    skipShiftWhenUnconfigured: true,
    serviceSchedule: DEFAULT_SERVICE_SCHEDULE,
  },
  reporting: {
    enabled: true,
    maxRangeDays: 90,
  },
  csat: {
    enabled: false,
    required: false,
    scaleMax: 5,
  },
  cannedResponses: {
    enabled: true,
  },
};

/** Shallow-merge operations sections (same semantics as Nest `mergeOperations`). */
export function mergeChatOperationsJson(
  base: ChatOperationsJson,
  patch?: Partial<ChatOperationsJson> | null,
): ChatOperationsJson {
  if (!patch || typeof patch !== "object") return base;
  return { ...base, ...patch };
}
