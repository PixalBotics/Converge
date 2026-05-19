import type { EmailTestResult } from "@/api/types/email.types";
import type { MailProviderSettings } from "../types";

export function readTestMessage(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s || null;
}

export function mergeTestResultIntoSettings(
  settings: MailProviderSettings,
  result: EmailTestResult,
): MailProviderSettings {
  return {
    ...settings,
    lastTestStatus: result.success ? "success" : "failed",
    lastTestedAt: result.testedAt ?? new Date().toISOString(),
    lastTestMessage: readTestMessage(result.message) ?? (result.success ? "Test email sent." : "Test failed."),
  };
}

export function pickStoredTestMessage(settings?: {
  lastTestMessage?: string | null;
  lastTestStatus?: "success" | "failed" | null;
}): string | null {
  if (!settings?.lastTestStatus) return null;
  return readTestMessage(settings.lastTestMessage);
}
