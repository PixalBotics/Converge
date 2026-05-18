import { isAxiosError } from "axios";
import {
  createWidgetInstallation,
  getAdminWidget,
  patchWidgetConfiguration,
} from "@/api/widgets/widgets.api";
import type { JsonRecord } from "@/api/types/common.types";
import {
  buildMinimalWidgetInstallationBody,
  buildWidgetPatchConfigurationBody,
  type ChatWidgetWizardPatchScope,
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

/**
 * Confirms `remoteWidgetKey` still exists on the server (avoids skipping `POST /widgets/installations`
 * when localStorage holds a stale key after DB reset or env change).
 */
export async function isServerWidgetDraftAlive(widgetKey: string | undefined | null): Promise<boolean> {
  const k = widgetKey?.trim();
  if (!k) return false;
  try {
    const res = await getAdminWidget(k);
    return res.success === true;
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) return false;
    throw e;
  }
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
  /** CHAT add-widget flow: limit PATCH to fields from the current step. */
  chatWizardPatchScope?: ChatWidgetWizardPatchScope;
}): Promise<JsonRecord> {
  const widgetType = wizardKindToApiType(params.widgetKind);
  const body = buildWidgetPatchConfigurationBody({
    draft: params.draft,
    widgetType,
    publishNow: params.publishNow ?? false,
    assetUrls: params.assetUrls,
    embedAllowAnyOrigin: params.embedAllowAnyOrigin,
    chatWizardPatchScope: params.chatWizardPatchScope,
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
