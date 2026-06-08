"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { JsonRecord } from "@/api/types/common.types";
import { getWidgetSnapshot, widgetResponseData } from "@/api/widgets/widgets.api";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { mapWidgetSnapshotToWidgetDraft } from "./map-widget-snapshot-to-draft";
import type { WidgetDraft } from "./widgetDraft";
import { loadInquiryTopicsFromScheduling } from "./hydrate-widget-inquiry-from-scheduling";
import {
  patchCreateWizardDraft,
  patchEditWizardDraft,
  readCreateWizardDraft,
  readEditWizardDraft,
  replaceEditWizardDraftFromApi,
  resetCreateWizardDraft,
} from "./widget-wizard-draft-store";

export const CHAT_WIDGET_EDIT_QUERY_PARAM = "edit";

/** Avoid re-fetching GET snapshot on every wizard step mount — keeps in-memory draft authoritative. */
const hydratedEditWidgetKeys = new Set<string>();

export function clearWizardEditHydration(widgetKey?: string): void {
  const k = widgetKey?.trim() ?? "";
  if (k) hydratedEditWidgetKeys.delete(k);
  else hydratedEditWidgetKeys.clear();
}

export function readChatWizardDraft(editWidgetKey: string | undefined | null): WidgetDraft {
  const k = editWidgetKey?.trim() ?? "";
  return k ? readEditWizardDraft(k) : readCreateWizardDraft();
}

export function saveChatWizardDraft(
  editWidgetKey: string | undefined | null,
  patch: Partial<WidgetDraft>,
): void {
  const k = editWidgetKey?.trim() ?? "";
  if (k) patchEditWizardDraft(k, patch);
  else patchCreateWizardDraft(patch);
}

export { resetCreateWizardDraft };

export function resolveRemoteWidgetKeyForChatWizard(
  editWidgetKey: string | undefined | null,
  draft: WidgetDraft,
): string {
  const edit = editWidgetKey?.trim() ?? "";
  if (edit) return edit;
  return draft.remoteWidgetKey?.trim() ?? "";
}

export function withChatEditQuery(basePath: string, editWidgetKey: string | undefined | null): string {
  const k = editWidgetKey?.trim();
  if (!k) return basePath;
  const sep = basePath.includes("?") ? "&" : "?";
  return `${basePath}${sep}${CHAT_WIDGET_EDIT_QUERY_PARAM}=${encodeURIComponent(k)}`;
}

/** Prefer hook state; if empty (stale `useSearchParams`), fall back to `window.location` so `?edit=` is never dropped on `router.push`. */
export function resolveEditWidgetKeyForNavigation(preferred: string | undefined | null): string {
  const p = preferred?.trim() ?? "";
  if (p) return p;
  if (typeof window === "undefined") return "";
  try {
    return (new URLSearchParams(window.location.search).get(CHAT_WIDGET_EDIT_QUERY_PARAM) ?? "").trim();
  } catch {
    return "";
  }
}

export function useChatWidgetWizardEdit(): {
  editWidgetKey: string;
  isEdit: boolean;
  /** False while GET /widgets/:widgetKey/snapshot hydrates the in-memory edit draft. */
  draftReady: boolean;
  hydrateError: string | null;
  /** Re-fetch widget from API and refresh form state (edit flow). */
  reloadFromServer: () => Promise<void>;
} {
  const searchParams = useSearchParams();
  const editWidgetKey = (searchParams.get(CHAT_WIDGET_EDIT_QUERY_PARAM) ?? "").trim();
  const isEdit = Boolean(editWidgetKey);

  const [draftReady, setDraftReady] = useState(!isEdit);
  const [hydrateError, setHydrateError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!editWidgetKey) {
      setDraftReady(true);
      setHydrateError(null);
      return;
    }

    if (hydratedEditWidgetKeys.has(editWidgetKey)) {
      setDraftReady(true);
      setHydrateError(null);
      return;
    }

    let cancelled = false;
    setDraftReady(false);
    setHydrateError(null);

    void (async () => {
      try {
        const res = await getWidgetSnapshot(editWidgetKey);
        if (cancelled) return;
        const data = widgetResponseData<JsonRecord>(res);
        const mapped = mapWidgetSnapshotToWidgetDraft(data, editWidgetKey);
        const wid = mapped.websiteId?.trim() ?? "";
        if (wid) {
          const fromScheduling = await loadInquiryTopicsFromScheduling(wid);
          if (fromScheduling.length > 0) {
            mapped.inquiryOptions = fromScheduling;
            mapped.inquiryOn = true;
          }
        }
        replaceEditWizardDraftFromApi(editWidgetKey, {
          ...mapped,
          websiteId:
            mapped.websiteId?.trim() ||
            (typeof data.websiteId === "string" ? data.websiteId : undefined) ||
            (typeof data.website_id === "string" ? data.website_id : undefined),
        });
        hydratedEditWidgetKeys.add(editWidgetKey);
      } catch (e) {
        if (!cancelled) {
          setHydrateError(extractApiErrorMessageForToast(e) ?? "Failed to load widget for editing.");
        }
      } finally {
        if (!cancelled) setDraftReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editWidgetKey, reloadToken]);

  return {
    editWidgetKey,
    isEdit,
    draftReady,
    hydrateError,
    reloadFromServer: async () => {
      if (!editWidgetKey) return;
      clearWizardEditHydration(editWidgetKey);
      setReloadToken((t) => t + 1);
    },
  };
}
