import {
  createWidgetInstallation,
  patchWidgetConfiguration,
} from "@/api/widgets/widgets.api";
import type { JsonRecord } from "@/api/types/common.types";
import {
  buildMinimalWidgetInstallationBody,
  buildWidgetPatchConfigurationBody,
  type WidgetInstallationAssetUrls,
} from "./build-widget-install-body";
import {
  pickInstallWidgetKeys,
  pickRequiresPublishBeforeEmbed,
  pickWidgetRemoteStatus,
  unwrapWidgetInstallEnvelope,
} from "./widget-install-response";
import type { WidgetDraft } from "./widgetDraft";

export type WizardWidgetKind = "chat" | "text";

export function wizardKindToApiType(kind: WizardWidgetKind) {
  return kind === "text" ? ("TEXT_US" as const) : ("CHAT" as const);
}

export async function createRemoteWidgetDraft(params: {
  draft: WidgetDraft;
  widgetKind: WizardWidgetKind;
}): Promise<{
  widgetKey: string;
  deployKey: string;
  requiresPublishBeforeEmbed: boolean;
  inner: JsonRecord;
}> {
  const websiteId = params.draft.websiteId?.trim();
  if (!websiteId)
    throw new Error("Website is required before saving a backend draft.");

  const widgetType = wizardKindToApiType(params.widgetKind);
  const body = buildMinimalWidgetInstallationBody({
    websiteId,
    widgetType,
    publishNow: false,
  });

  const res = await createWidgetInstallation(body);
  const inner = unwrapWidgetInstallEnvelope(res);
  const keys = pickInstallWidgetKeys(inner);
  const requiresPublishBeforeEmbed = pickRequiresPublishBeforeEmbed(inner);

  if (!keys.widgetKey) {
    throw new Error(
      "Server did not return widgetKey while saving draft (publishNow: false).",
    );
  }

  return {
    widgetKey: keys.widgetKey,
    deployKey: keys.deployKey,
    requiresPublishBeforeEmbed,
    inner,
  };
}

export async function patchRemoteWidgetConfiguration(params: {
  widgetKey: string;
  widgetKind: WizardWidgetKind;
  draft: WidgetDraft;
  publishNow?: boolean;
  assetUrls?: WidgetInstallationAssetUrls;
  embedAllowAnyOrigin?: boolean;
}): Promise<JsonRecord> {
  const widgetType = wizardKindToApiType(params.widgetKind);
  const body = buildWidgetPatchConfigurationBody({
    draft: params.draft,
    widgetType,
    publishNow: params.publishNow ?? false,
    assetUrls: params.assetUrls,
    embedAllowAnyOrigin: params.embedAllowAnyOrigin,
  });

  const res = await patchWidgetConfiguration(params.widgetKey, body);
  return unwrapWidgetInstallEnvelope(res);
}

export function summarizePatchResult(inner: JsonRecord) {
  return {
    widgetKey: pickInstallWidgetKeys(inner).widgetKey,
    deployKey: pickInstallWidgetKeys(inner).deployKey,
    requiresPublishBeforeEmbed: pickRequiresPublishBeforeEmbed(inner),
    status: pickWidgetRemoteStatus(inner),
  };
}
