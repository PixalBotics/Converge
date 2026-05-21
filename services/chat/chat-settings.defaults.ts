import type { ChatOperationsJson } from "./chat-settings.types";

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
    requireHrmsShiftForInternal: true,
    skipShiftWhenUnconfigured: true,
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
