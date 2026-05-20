import { isRecord } from "@/lib/utils/records";
import type { JsonRecord } from "@/api/types/common.types";
import { widgetResponseData } from "@/api/widgets/widgets.api";
import { mapAdminWidgetResponseToWidgetDraft } from "./admin-widget-to-draft";
import { mergeWidgetConfigForEdit } from "./merge-widget-config-for-edit";
import type { WidgetDraft } from "./widgetDraft";

function pickRecord(...items: unknown[]): JsonRecord | null {
  for (const item of items) {
    if (isRecord(item)) return item;
  }
  return null;
}

/**
 * Maps `GET /widgets/:widgetKey/snapshot` into wizard `WidgetDraft` fields.
 * Edit hydration prefers `latestVersion` (draft/config) and does not fall back to published version data.
 */
export function mapWidgetSnapshotToWidgetDraft(
  snapshotPayload: unknown,
  widgetKey: string,
): Partial<WidgetDraft> {
  const snapshot = widgetResponseData<JsonRecord>(snapshotPayload as never);
  if (!isRecord(snapshot)) {
    return { remoteWidgetKey: widgetKey, widgetId: widgetKey };
  }

  const latestVersion = pickRecord(snapshot.latestVersion);
  const latestVersionConfig = pickRecord(latestVersion?.config);
  const draftOverlay = pickRecord(latestVersion?.draftConfig, snapshot.draftConfig);
  const mergedConfig = mergeWidgetConfigForEdit(latestVersionConfig, draftOverlay);

  const syntheticAdminShape: JsonRecord = {
    widgetKey: snapshot.widgetKey ?? widgetKey,
    websiteId: snapshot.websiteId ?? snapshot.website_id,
    widgetType: snapshot.widgetType ?? snapshot.widget_type,
    chatMode: mergedConfig.chatMode ?? mergedConfig.chat_mode ?? mergedConfig.mode,
    allowedDomains:
      mergedConfig.allowedDomains ??
      snapshot.allowedDomains ??
      snapshot.allowed_domains,
    embedAllowAnyOrigin: snapshot.embedAllowAnyOrigin ?? snapshot.embed_allow_any_origin,
    config: mergedConfig,
  };

  return mapAdminWidgetResponseToWidgetDraft(syntheticAdminShape, widgetKey);
}
