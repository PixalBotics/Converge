/** Display format used across dashboard forms, e.g. `+1 (555) 012-3456`. */
export const PHONE_INPUT_PLACEHOLDER = "+1 (555) 012-3456";

/** Format digits as the user types (US +1 grouping; other country codes stay as `+digits`). */
export function formatPhoneInputValue(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("1")) {
    const national = digits.slice(1, 11);
    if (national.length === 0) return "+1";
    if (national.length <= 3) return `+1 (${national}`;
    if (national.length <= 6) return `+1 (${national.slice(0, 3)}) ${national.slice(3)}`;
    return `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
  }

  if (digits.length <= 10) {
    const national = digits;
    if (national.length <= 3) return `+1 (${national}`;
    if (national.length <= 6) return `+1 (${national.slice(0, 3)}) ${national.slice(3)}`;
    return `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
  }

  return `+${digits.slice(0, 15)}`;
}
