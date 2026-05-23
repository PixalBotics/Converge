import type { ServiceSchedulingBundle } from "@/services/chat/service-scheduling.types";
import {
  bundleToDraft,
  canShowExternalSlots,
  canShowInternalSlots,
  validateSchedulingDraft,
} from "@/features/chat-settings/components/service-scheduling-form.utils";

/** True when hours, timezone, and at least one complete active topic exist. */
export function isServiceSchedulingReady(
  bundle: ServiceSchedulingBundle | null | undefined,
): boolean {
  if (!bundle) return false;
  const draft = bundleToDraft(bundle);
  if (validateSchedulingDraft(draft)) return false;
  const activeTopics = draft.topics.filter(
    (t) =>
      t.isActive !== false &&
      t.routingKey.trim() &&
      t.clientLabel.trim() &&
      t.internalDepartmentId.trim() &&
      t.externalDepartmentId.trim(),
  );
  return activeTopics.length > 0;
}
