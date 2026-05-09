"use client";

import { useParams } from "next/navigation";
import { WidgetConfigurationEditor } from "@/components/dashboard/chat-widget/WidgetConfigurationEditor";

/** Full configuration edit: PATCH /widgets/:widgetKey (+ optional publish); DELETE soft-delete. */
export default function ChatWidgetEditPage() {
  const params = useParams();
  const raw = params?.widgetKey;
  const widgetKey = decodeURIComponent(
    Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? ""),
  ).trim();

  if (!widgetKey) return null;

  return <WidgetConfigurationEditor widgetKey={widgetKey} />;
}
