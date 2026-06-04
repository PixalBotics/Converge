"use client";

import { useCallback, useEffect, useState } from "react";
import type { JsonRecord } from "@/api/types/common.types";
import {
  getAdminWidget,
  publishWidget,
  widgetResponseData,
} from "@/api/widgets/widgets.api";
import {
  hasUnpublishedDraft,
  parseWidgetAdminMeta,
  widgetLifecycleStatusLabel,
  type WidgetAdminMeta,
} from "@/lib/chat-widget/widget-admin-meta";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";

export function useWidgetAdminLifecycle(widgetKey: string | undefined | null) {
  const key = widgetKey?.trim() ?? "";
  const [meta, setMeta] = useState<WidgetAdminMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!key) {
      setMeta(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminWidget(key);
      setMeta(parseWidgetAdminMeta(widgetResponseData<JsonRecord>(res)));
    } catch (e) {
      setMeta(null);
      setError(extractApiErrorMessageForToast(e) ?? "Failed to load widget status.");
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const publishLatest = useCallback(async () => {
    if (!key) return;
    setBusy(true);
    try {
      await publishWidget(key);
      publishAppToast({ variant: "success", message: "Widget published. Live embed updated." });
      await refresh();
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Publish failed.",
      });
    } finally {
      setBusy(false);
    }
  }, [key, refresh]);

  return {
    meta,
    loading,
    error,
    busy,
    refresh,
    publishLatest,
    statusLabel: meta ? widgetLifecycleStatusLabel(meta) : null,
    deployState: meta?.deploy.state ?? null,
    unpublishedDraft: meta ? hasUnpublishedDraft(meta) : false,
  };
}
