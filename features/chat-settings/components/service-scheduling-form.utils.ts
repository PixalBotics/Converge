import type {
  OperatingChannels,
  ServiceScheduleWindow,
  ServiceSchedulingBundle,
  ServiceSchedulingTopic,
  ServiceSchedulingTopicInput,
  UpsertServiceSchedulingBody,
} from "@/services/chat/service-scheduling.types";
import {
  normalizeDaysOfWeek,
  normalizeScheduleWindow,
  WEEKDAY_CODES,
  type WeekdayCode,
} from "@/features/website-assignments/utils/schedule-weekday.utils";

export function canShowInternalSlots(op: OperatingChannels): boolean {
  return op === "internal_only" || op === "both";
}

export function canShowExternalSlots(op: OperatingChannels): boolean {
  return op === "external_only" || op === "both";
}

export function emptyScheduleWindow(): ServiceScheduleWindow {
  return {
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startTime: "09:00",
    endTime: "18:00",
    crossesMidnight: false,
  };
}

/** Full-week 24/7 service window (matches backend crosses-midnight 00:00→00:00 logic). */
export function twentyFourHourScheduleWindow(): ServiceScheduleWindow {
  return {
    daysOfWeek: [...WEEKDAY_CODES],
    startTime: "00:00",
    endTime: "00:00",
    crossesMidnight: true,
  };
}

export function isTwentyFourHourWindow(window: ServiceScheduleWindow): boolean {
  const days = normalizeDaysOfWeek(window.daysOfWeek as Array<string | number>);
  if (days.length !== WEEKDAY_CODES.length) return false;
  if (
    window.startTime === "00:00" &&
    window.endTime === "00:00" &&
    window.crossesMidnight === true
  ) {
    return true;
  }
  return window.startTime === "00:00" && window.endTime === "23:59";
}

/** Keep a single service window in the draft (no multi-window UI). */
export function singleServiceWindow(
  windows: ServiceScheduleWindow[],
): ServiceScheduleWindow[] {
  if (!windows.length) return [emptyScheduleWindow()];
  return [normalizeScheduleWindow({ ...windows[0]! })];
}

export function emptyTopic(displayOrder = 0): ServiceSchedulingTopic {
  return {
    routingKey: "",
    clientLabel: "",
    displayOrder,
    isActive: true,
    internalDepartmentId: "",
    internalPoolId: null,
    externalDepartmentId: "",
    externalPoolId: null,
  };
}

export function defaultSchedulingDraft(): Pick<
  ServiceSchedulingBundle,
  | "operatingChannels"
  | "timezone"
  | "internalTimezone"
  | "externalTimezone"
  | "gapPolicy"
  | "internalWindows"
  | "externalWindows"
  | "topics"
  | "defaultDepartmentId"
> {
  return {
    operatingChannels: "internal_only",
    timezone: "Asia/Karachi",
    internalTimezone: "Asia/Karachi",
    externalTimezone: "Asia/Karachi",
    gapPolicy: "queue_until_next_window",
    internalWindows: [emptyScheduleWindow()],
    externalWindows: [emptyScheduleWindow()],
    topics: [emptyTopic(0)],
    defaultDepartmentId: null,
  };
}

export function bundleToDraft(bundle: ServiceSchedulingBundle) {
  const fallbackTz = bundle.timezone?.trim() || "Asia/Karachi";
  return {
    operatingChannels: bundle.operatingChannels,
    timezone: fallbackTz,
    internalTimezone: bundle.internalTimezone?.trim() || fallbackTz,
    externalTimezone: bundle.externalTimezone?.trim() || fallbackTz,
    gapPolicy: bundle.gapPolicy,
    internalWindows: singleServiceWindow(
      bundle.internalWindows.length > 0
        ? bundle.internalWindows.map((w) => normalizeScheduleWindow({ ...w }))
        : [emptyScheduleWindow()],
    ),
    externalWindows: singleServiceWindow(
      bundle.externalWindows.length > 0
        ? bundle.externalWindows.map((w) => normalizeScheduleWindow({ ...w }))
        : [emptyScheduleWindow()],
    ),
    topics: bundle.topics.length > 0 ? bundle.topics.map((t) => ({ ...t })) : [emptyTopic(0)],
    defaultDepartmentId: bundle.defaultDepartmentId,
  };
}

export function windowsForSave(
  windows: ServiceScheduleWindow[],
): UpsertServiceSchedulingBody["internalWindows"] {
  return singleServiceWindow(windows).map((w) => ({
    daysOfWeek: w.daysOfWeek,
    startTime: w.startTime,
    endTime: w.endTime,
    ...(w.crossesMidnight ? { crossesMidnight: true } : {}),
  }));
}

export function topicsForSave(topics: ServiceSchedulingTopic[]): ServiceSchedulingTopicInput[] {
  return topics.map((t, index) => ({
    routingKey: t.routingKey.trim(),
    clientLabel: t.clientLabel.trim(),
    internalDepartmentId: t.internalDepartmentId.trim(),
    externalDepartmentId: t.externalDepartmentId.trim(),
    internalPoolId: t.internalPoolId?.trim() || null,
    externalPoolId: t.externalPoolId?.trim() || null,
    displayOrder: t.displayOrder ?? index,
    isActive: t.isActive !== false,
  }));
}

export function buildSaveBody(draft: ReturnType<typeof bundleToDraft>): UpsertServiceSchedulingBody {
  const internalTz = draft.internalTimezone.trim();
  const externalTz = draft.externalTimezone.trim();
  const body: UpsertServiceSchedulingBody = {
    operatingChannels: draft.operatingChannels,
    timezone: internalTz || externalTz || draft.timezone.trim(),
    internalTimezone: internalTz,
    externalTimezone: externalTz,
    gapPolicy: draft.gapPolicy,
    topics: topicsForSave(draft.topics),
    defaultDepartmentId: draft.defaultDepartmentId?.trim() || null,
  };
  if (canShowInternalSlots(draft.operatingChannels)) {
    body.internalWindows = windowsForSave(draft.internalWindows);
  }
  if (canShowExternalSlots(draft.operatingChannels)) {
    body.externalWindows = windowsForSave(draft.externalWindows);
  }
  return body;
}

export function validateSchedulingDraft(
  draft: ReturnType<typeof bundleToDraft>,
): string | null {
  if (canShowInternalSlots(draft.operatingChannels) && !draft.internalTimezone.trim()) {
    return "Internal timezone is required.";
  }
  if (canShowExternalSlots(draft.operatingChannels) && !draft.externalTimezone.trim()) {
    return "External timezone is required.";
  }
  if (canShowInternalSlots(draft.operatingChannels) && draft.internalWindows.length === 0) {
    return "Add at least one internal service window.";
  }
  if (canShowExternalSlots(draft.operatingChannels) && draft.externalWindows.length === 0) {
    return "Add at least one external service window.";
  }
  for (const w of draft.internalWindows) {
    if (normalizeDaysOfWeek(w.daysOfWeek as Array<string | number>).length === 0) {
      return "Select at least one weekday for each internal service window.";
    }
  }
  for (const w of draft.externalWindows) {
    if (normalizeDaysOfWeek(w.daysOfWeek as Array<string | number>).length === 0) {
      return "Select at least one weekday for each external service window.";
    }
  }
  for (const t of draft.topics) {
    if (!t.routingKey.trim()) return "Each topic needs a routing key.";
    if (!t.clientLabel.trim()) return "Each topic needs a client label.";
    if (!t.internalDepartmentId.trim()) return "Each topic needs an internal department.";
    if (!t.externalDepartmentId.trim()) return "Each topic needs an external department.";
  }
  return null;
}
