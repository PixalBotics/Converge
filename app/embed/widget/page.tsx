"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EmbedWidgetClient } from "@/components/embed/EmbedWidgetClient";

function EmbedWidgetPageInner() {
  const sp = useSearchParams();

  const widgetKey =
    sp.get("widgetKey") || sp.get("widget-key") || "";
  const parentHost = sp.get("parentHost") || sp.get("parent_host") || "";

  let parentPageUrl =
    sp.get("parentPage") || sp.get("parent_page") || sp.get("ref") || "";
  if (parentPageUrl) {
    try {
      parentPageUrl = decodeURIComponent(parentPageUrl);
    } catch {
      /* already decoded */
    }
  }

  const sandboxMode =
    sp.get("sandbox") === "1" ||
    sp.get("sandbox") === "true" ||
    sp.get("trainingTest") === "1";

  if (!widgetKey) {
    return (
      <main style={{ padding: 16, fontFamily: "system-ui,sans-serif", fontSize: 14 }}>
        Missing widgetKey query parameter.
      </main>
    );
  }

  return (
    <main
      style={{
        padding: 0,
        margin: 0,
        background: "transparent",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <EmbedWidgetClient
        widgetKey={widgetKey}
        parentHost={parentHost}
        parentPageUrl={parentPageUrl}
        sandboxMode={sandboxMode}
      />
    </main>
  );
}

export default function EmbedWidgetPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: 16, fontFamily: "system-ui,sans-serif" }}>
          Loading…
        </main>
      }
    >
      <EmbedWidgetPageInner />
    </Suspense>
  );
}
