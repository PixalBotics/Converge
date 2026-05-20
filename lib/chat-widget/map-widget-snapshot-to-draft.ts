import { isRecord } from "@/lib/utils/records";
import type { JsonRecord } from "@/api/types/common.types";
import { widgetResponseData } from "@/api/widgets/widgets.api";
import { mapAdminWidgetResponseToWidgetDraft } from "./admin-widget-to-draft";
import { resolveSnapshotConfigRoot } from "./widget-patch-editor-model";
import type { WidgetDraft } from "./widgetDraft";

/**
 * Maps `GET /widgets/:widgetKey/snapshot` into wizard `WidgetDraft` fields (full published/draft config).
 */
export function mapWidgetSnapshotToWidgetDraft(
  snapshotPayload: unknown,
  widgetKey: string,
): Partial<WidgetDraft> {
  const snapshot = widgetResponseData<JsonRecord>(snapshotPayload as never);
  if (!isRecord(snapshot)) {
    return { remoteWidgetKey: widgetKey, widgetId: widgetKey };
  }

  const configRoot = resolveSnapshotConfigRoot(snapshot);
  const lv = isRecord(snapshot.latestVersion) ? snapshot.latestVersion : null;
  const lvConfig = lv && isRecord(lv.config) ? lv.config : null;
  const mergedConfig: JsonRecord = {
    ...(isRecord(lvConfig) ? lvConfig : {}),
    ...configRoot,
  };

  const syntheticAdminShape: JsonRecord = {
    widgetKey: snapshot.widgetKey ?? widgetKey,
    websiteId: snapshot.websiteId ?? snapshot.website_id,
    widgetType: snapshot.widgetType ?? snapshot.widget_type,
    chatMode: mergedConfig.chatMode ?? mergedConfig.chat_mode,
    allowedDomains: mergedConfig.allowedDomains ?? snapshot.allowedDomains,
    embedAllowAnyOrigin: snapshot.embedAllowAnyOrigin ?? snapshot.embed_allow_any_origin,
    config: mergedConfig,
  };

  return mapAdminWidgetResponseToWidgetDraft(syntheticAdminShape, widgetKey);
}
