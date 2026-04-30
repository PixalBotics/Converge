import { Suspense } from "react";
import type { Metadata } from "next";
import { EmbeddableChatWidget } from "@/components/embed/EmbeddableChatWidget";

export const metadata: Metadata = {
  title: "Chat widget",
  robots: { index: false, follow: false },
};

export default function EmbedChatWidgetPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: "100%",
            height: "100vh",
            background: "transparent",
          }}
        />
      }
    >
      <EmbeddableChatWidget />
    </Suspense>
  );
}
