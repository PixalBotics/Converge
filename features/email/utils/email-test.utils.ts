import { isAxiosError } from "axios";
import { normalizeTestToEmail } from "@/api/email/build-email-test-body";
import type { EmailTestResult } from "@/api/types/email.types";
import { extractApiErrorMessageForToast } from "@/lib/notify";
import type { MailProviderSettings } from "../types";

export { normalizeTestToEmail } from "@/api/email/build-email-test-body";
export { buildEmailTestRequestBody } from "@/api/email/build-email-test-body";

/** Practical check before API (backend uses class-validator `isEmail`). */
const TEST_TO_EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Empty is allowed (backend uses login email). Non-empty must be valid. */
export function validateTestToEmail(value?: string | null): string | null {
  const email = normalizeTestToEmail(value);
  if (!email) return null;
  if (!TEST_TO_EMAIL_RE.test(email)) {
    return 'Enter a valid email address, for example name@company.com.';
  }
  return null;
}

export function extractEmailTestErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const root = data as Record<string, unknown>;
      const err = root.error;
      if (err && typeof err === "object" && !Array.isArray(err)) {
        const errObj = err as Record<string, unknown>;
        const msg = readTestMessage(errObj.message);
        if (msg) return msg;
        const details = errObj.details;
        if (details && typeof details === "object" && !Array.isArray(details)) {
          const fe = (details as Record<string, unknown>).fieldErrors;
          if (fe && typeof fe === "object" && !Array.isArray(fe)) {
            const toEmailErr = (fe as Record<string, unknown>).toEmail;
            if (Array.isArray(toEmailErr) && toEmailErr[0]) return String(toEmailErr[0]);
            if (typeof toEmailErr === "string" && toEmailErr.trim()) return toEmailErr.trim();
          }
        }
      }
    }
  }
  return extractApiErrorMessageForToast(error) ?? "Test email failed.";
}

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
