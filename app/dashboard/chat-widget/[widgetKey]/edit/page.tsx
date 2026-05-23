"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CHAT_WIDGET_EDIT_QUERY_PARAM } from "@/lib/chat-widget/chat-wizard-edit";

/** Opens the same 3-step CHAT wizard as create, with `?edit=` + GET-hydrated draft + PATCH on each step. */
export default function ChatWidgetEditPage() {
  const params = useParams();
  const router = useRouter();
  const raw = params?.widgetKey;
  const widgetKey = decodeURIComponent(
    Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? ""),
  ).trim();

  useEffect(() => {
    if (!widgetKey) return;
    router.replace(
      `/dashboard/chat-widget/add/chat/button?${CHAT_WIDGET_EDIT_QUERY_PARAM}=${encodeURIComponent(widgetKey)}`,
    );
  }, [widgetKey, router]);

  return null;
}
