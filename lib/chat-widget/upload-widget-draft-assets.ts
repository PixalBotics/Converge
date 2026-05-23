import { uploadWidgetAsset } from "@/api/widgets/widgets.api";
import type { JsonRecord } from "@/api/types/common.types";
import type { WidgetInstallationAssetUrls } from "./build-widget-install-body";
import type { WidgetDraft } from "./widgetDraft";

function readPublicUrl(payload: JsonRecord): string | undefined {
  if (typeof payload.publicUrl === "string" && payload.publicUrl) {
    return payload.publicUrl;
  }
  const nested = payload.data;
  if (
    typeof nested === "object" &&
    nested !== null &&
    typeof (nested as JsonRecord).publicUrl === "string"
  ) {
    return (nested as JsonRecord).publicUrl as string;
  }
  return undefined;
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File | null> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const type = blob.type || "application/octet-stream";
    return new File([blob], filename, { type });
  } catch {
    return null;
  }
}

const MAX_INLINE_BYTES = 48 * 1024 * 1024;

/**
 * Best-effort uploads for launcher icon and banner (skips oversized data URLs).
 */
export async function uploadDraftWidgetAssets(params: {
  websiteId: string;
  draft: WidgetDraft;
}): Promise<WidgetInstallationAssetUrls> {
  const { websiteId, draft } = params;
  const out: WidgetInstallationAssetUrls = {};

  const iconUrl = draft.iconDataUrl?.trim();
  if (
    iconUrl?.startsWith("data:") &&
    iconUrl.length < MAX_INLINE_BYTES
  ) {
    const file = await dataUrlToFile(iconUrl, "widget-button-icon.png");
    if (file) {
      try {
        const raw = await uploadWidgetAsset({
          websiteId,
          assetType: "button_icon",
          file,
        });
        const url = readPublicUrl(raw);
        if (url) out.buttonIconPublicUrl = url;
      } catch {
        /* optional */
      }
    }
  }

  const bannerUrl = draft.bannerDataUrl?.trim();
  if (bannerUrl?.startsWith("data:") && bannerUrl.length < MAX_INLINE_BYTES) {
    const isVideo = draft.bannerMediaType === "video";
    const ext = isVideo ? "mp4" : "jpg";
    const mime = isVideo ? "video/mp4" : "image/jpeg";
    const file = await dataUrlToFile(bannerUrl, `widget-banner.${ext}`);
    if (file) {
      try {
        const raw = await uploadWidgetAsset({
          websiteId,
          assetType: isVideo ? "banner_video" : "banner_image",
          file: new File([file], file.name, { type: file.type || mime }),
        });
        const url = readPublicUrl(raw);
        if (url) {
          if (isVideo) out.bannerVideoPublicUrl = url;
          else out.bannerImagePublicUrl = url;
        }
      } catch {
        /* optional */
      }
    }
  }

  return out;
}
