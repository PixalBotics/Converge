"use client";

import { defaultWidgetDraft, mergePartialWidgetDraft, type WidgetDraft } from "./widgetDraft";

function storageKey(widgetKey: string): string {
  return `chat_widget_edit_v1:${encodeURIComponent(widgetKey.trim())}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Isolated draft for editing an existing widget (does not touch create-flow `chat_widget_draft_v1`). */
export function readWidgetEditDraft(widgetKey: string): WidgetDraft {
  const id = widgetKey.trim();
  if (!canUseStorage() || !id) {
    return mergePartialWidgetDraft({ remoteWidgetKey: id, widgetId: id || defaultWidgetDraft.widgetId });
  }
  try {
    const raw = window.localStorage.getItem(storageKey(widgetKey));
    if (!raw) {
      return mergePartialWidgetDraft({
        type: "chat",
        remoteWidgetKey: id,
        widgetId: id,
      });
    }
    const parsed = JSON.parse(raw) as Partial<WidgetDraft>;
    return mergePartialWidgetDraft({
      ...parsed,
      type: "chat",
      remoteWidgetKey: id,
      widgetId: parsed.widgetId?.trim() || id,
    });
  } catch {
    return mergePartialWidgetDraft({ type: "chat", remoteWidgetKey: id, widgetId: id });
  }
}

export function saveWidgetEditDraft(widgetKey: string, update: Partial<WidgetDraft>): void {
  if (!canUseStorage() || !widgetKey.trim()) return;
  const current = readWidgetEditDraft(widgetKey);
  const next: WidgetDraft = {
    ...current,
    ...update,
    type: "chat",
    remoteWidgetKey: widgetKey.trim(),
    widgetId: update.widgetId?.trim() || current.widgetId || widgetKey.trim(),
  };
  try {
    window.localStorage.setItem(storageKey(widgetKey), JSON.stringify(next));
  } catch {
    try {
      window.localStorage.setItem(
        storageKey(widgetKey),
        JSON.stringify({ ...next, bannerDataUrl: "", iconDataUrl: "" }),
      );
    } catch {
      /* ignore */
    }
  }
}

export function clearWidgetEditDraft(widgetKey: string): void {
  if (!canUseStorage() || !widgetKey.trim()) return;
  try {
    window.localStorage.removeItem(storageKey(widgetKey));
  } catch {
    /* ignore */
  }
}
