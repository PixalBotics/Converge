import type {
  ServiceSchedulingBundle,
  VisitorTopicsBundle,
} from "@/services/chat/service-scheduling.types";
import {
  bundleToDraft,
  validateScheduleDraft,
} from "@/features/chat-settings/components/service-scheduling-form.utils";

/** True when service hours/timezone are valid and at least one complete inquire topic exists. */
export function isServiceSchedulingReady(
  bundle: ServiceSchedulingBundle | null | undefined,
  topicsBundle?: VisitorTopicsBundle | null,
): boolean {
  if (!bundle) return false;
  const draft = bundleToDraft(bundle);
  if (validateScheduleDraft(draft)) return false;
  const activeTopics = (topicsBundle?.topics ?? []).filter(
    (t) =>
      t.isActive !== false &&
      t.routingKey.trim() &&
      t.clientLabel.trim() &&
      t.internalDepartmentId.trim() &&
      t.externalDepartmentId.trim(),
  );
  return activeTopics.length > 0;
}
