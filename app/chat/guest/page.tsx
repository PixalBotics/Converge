"use client";

import { Suspense } from "react";
import { GuestChatPage } from "@/features/chat-guest";

function GuestChatFallback() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui,sans-serif", fontSize: 14 }}>
      Loading secure chat view…
    </main>
  );
}

export default function ChatGuestRoutePage() {
  return (
    <Suspense fallback={<GuestChatFallback />}>
      <GuestChatPage />
    </Suspense>
  );
}
