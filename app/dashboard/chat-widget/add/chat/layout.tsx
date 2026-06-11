"use client";

import type { ReactNode } from "react";
import { WidgetWizardSaveTraceProvider } from "@/features/chat-widget/components/WidgetWizardSaveTraceContext";

/** Shared provider for CHAT wizard steps (button → box → notifications → install). */
export default function ChatWidgetWizardLayout({ children }: { children: ReactNode }) {
  return <WidgetWizardSaveTraceProvider>{children}</WidgetWizardSaveTraceProvider>;
}
