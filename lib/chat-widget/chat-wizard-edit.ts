"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { JsonRecord } from "@/api/types/common.types";
import { getAdminWidget, widgetResponseData } from "@/api/widgets/widgets.api";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { mapAdminWidgetResponseToWidgetDraft } from "./admin-widget-to-draft";
import { readWidgetEditDraft, saveWidgetEditDraft } from "./widget-edit-draft";
import { readWidgetDraft, saveWidgetDraft, type WidgetDraft } from "./widgetDraft";

export const CHAT_WIDGET_EDIT_QUERY_PARAM = "edit";

const SESSION_HYDRATED_KEY = "converge_chat_wizard_edit_hydrated_v1:";

export function readChatWizardDraft(editWidgetKey: string | undefined | null): WidgetDraft {
  const k = editWidgetKey?.trim() ?? "";
  return k ? readWidgetEditDraft(k) : readWidgetDraft();
}

export function saveChatWizardDraft(
  editWidgetKey: string | undefined | null,
  patch: Partial<WidgetDraft>,
): void {
  const k = editWidgetKey?.trim() ?? "";
  if (k) saveWidgetEditDraft(k, patch);
  else saveWidgetDraft(patch);
}

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
  /** False while first GET→localStorage merge runs for this tab session. */
  draftReady: boolean;
  hydrateError: string | null;
} {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  /**
   * Read `edit` on every render (no `useMemo([searchParams])`): in Next.js 15 the
   * `ReadonlyURLSearchParams` reference can stay stable across client navigations, which
   * previously left `editWidgetKey` empty on step 3 so the notifications page never
   * treated the flow as edit / dropped `?edit=` on the next navigation.
   */
  const editWidgetKey = (searchParams.get(CHAT_WIDGET_EDIT_QUERY_PARAM) ?? "").trim();
  const isEdit = Boolean(editWidgetKey);

  const [draftReady, setDraftReady] = useState(!isEdit);
  const [hydrateError, setHydrateError] = useState<string | null>(null);

  useEffect(() => {
    if (!editWidgetKey) {
      setDraftReady(true);
      setHydrateError(null);
      return;
    }

    if (typeof window !== "undefined") {
      if (window.sessionStorage.getItem(SESSION_HYDRATED_KEY + editWidgetKey) === "1") {
        setDraftReady(true);
        setHydrateError(null);
        return;
      }
    }

    let cancelled = false;
    setDraftReady(false);
    setHydrateError(null);

    void (async () => {
      try {
        const res = await getAdminWidget(editWidgetKey);
        const data = widgetResponseData<JsonRecord>(res);
        const mapped = mapAdminWidgetResponseToWidgetDraft(data, editWidgetKey);
        const existing = readWidgetEditDraft(editWidgetKey);
        saveWidgetEditDraft(editWidgetKey, { ...existing, ...mapped });
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(SESSION_HYDRATED_KEY + editWidgetKey, "1");
        }
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
  }, [editWidgetKey, pathname, searchParams.toString()]);

  return { editWidgetKey, isEdit, draftReady, hydrateError };
}
