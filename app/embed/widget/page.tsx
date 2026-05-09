"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EmbedWidgetClient } from "@/components/embed/EmbedWidgetClient";

function EmbedWidgetPageInner() {
  const sp = useSearchParams();

  const widgetKey =
    sp.get("widgetKey") || sp.get("widget-key") || "";
  const deployKey = sp.get("deployKey") || sp.get("deploy-key") || "";
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

  if (!widgetKey || !deployKey) {
    return (
      <main style={{ padding: 16, fontFamily: "system-ui,sans-serif", fontSize: 14 }}>
        Missing widgetKey or deployKey query parameters.
      </main>
    );
  }

  return (
    <main style={{ padding: 0, margin: 0 }}>
      <EmbedWidgetClient
        widgetKey={widgetKey}
        deployKey={deployKey}
        parentHost={parentHost}
        parentPageUrl={parentPageUrl}
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
