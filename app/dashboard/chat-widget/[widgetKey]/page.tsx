"use client";

import { useParams } from "next/navigation";
import { ChatWidgetDetailClient } from "@/features/chat-widget";

/** Widget id in the URL is the API `widgetKey` (opaque string from GET /widgets). */
export default function ChatWidgetDetailPage() {
  const params = useParams();
  const raw = params?.widgetKey;
  const widgetKey = decodeURIComponent(
    Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? ""),
  ).trim();

  if (!widgetKey) return null;

  return <ChatWidgetDetailClient widgetKey={widgetKey} variant="view" />;
}
