import type { WidgetInstallationAssetUrls } from "./build-widget-install-body";
import type { WidgetDraft } from "./widgetDraft";
import {
  uploadDraftWidgetAssets,
  type WidgetAssetUploadResult,
} from "./upload-widget-draft-assets";

function isHttpUrl(value: string | undefined): value is string {
  const v = value?.trim();
  return Boolean(v && (v.startsWith("http://") || v.startsWith("https://")));
}

/** Published or previously uploaded URLs already on the draft. */
export function resolveExistingHttpAssetUrls(
  draft: WidgetDraft,
): WidgetInstallationAssetUrls {
  const out: WidgetInstallationAssetUrls = {};
  if (isHttpUrl(draft.iconDataUrl)) out.buttonIconPublicUrl = draft.iconDataUrl.trim();
  if (isHttpUrl(draft.proactiveTeaserAvatarDataUrl)) {
    out.teaserAvatarPublicUrl = draft.proactiveTeaserAvatarDataUrl.trim();
  }
  if (isHttpUrl(draft.bannerDataUrl)) {
    if (draft.bannerMediaType === "video") {
      out.bannerVideoPublicUrl = draft.bannerDataUrl.trim();
    } else {
      out.bannerImagePublicUrl = draft.bannerDataUrl.trim();
    }
  }
  return out;
}

/**
 * Upload inline data URLs when needed, merge with existing http URLs and optional overrides.
 */
export async function resolveWidgetDraftAssetUrls(params: {
  websiteId: string;
  draft: WidgetDraft;
  overrides?: WidgetInstallationAssetUrls;
}): Promise<WidgetAssetUploadResult> {
  const existing = resolveExistingHttpAssetUrls(params.draft);
  const uploaded = await uploadDraftWidgetAssets({
    websiteId: params.websiteId,
    draft: params.draft,
  });
  return {
    urls: {
      ...existing,
      ...uploaded.urls,
      ...params.overrides,
    },
    errors: uploaded.errors,
  };
}

/** Replace data URLs in local draft with published http asset URLs after upload. */
export function persistAssetUrlsOnDraft(
  draft: WidgetDraft,
  urls: WidgetInstallationAssetUrls,
): Partial<WidgetDraft> {
  const out: Partial<WidgetDraft> = {};
  if (urls.buttonIconPublicUrl) out.iconDataUrl = urls.buttonIconPublicUrl;
  if (urls.teaserAvatarPublicUrl) {
    out.proactiveTeaserAvatarDataUrl = urls.teaserAvatarPublicUrl;
  }
  if (urls.bannerImagePublicUrl) {
    out.bannerDataUrl = urls.bannerImagePublicUrl;
    out.bannerMediaType = "image";
  } else if (urls.bannerVideoPublicUrl) {
    out.bannerDataUrl = urls.bannerVideoPublicUrl;
    out.bannerMediaType = "video";
  }
  return out;
}
