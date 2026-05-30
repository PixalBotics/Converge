/** Shared validation for widget wizard inputs (mirrors backend rules). */

const URL_PROTOCOL = /^https?:\/\//i;

export function normalizeSingleUrlInput(raw: string): string {
  return raw.trim();
}

export function validateSingleHttpUrl(
  raw: string,
  options?: { required?: boolean; label?: string },
): string | null {
  const label = options?.label ?? "URL";
  const value = normalizeSingleUrlInput(raw);
  if (!value) {
    return options?.required ? `${label} is required.` : null;
  }
  if (!URL_PROTOCOL.test(value)) {
    return `${label} must start with http:// or https://`;
  }
  if (/\s/.test(value)) {
    return `${label} must be a single link (no spaces).`;
  }
  const parts = value.split(/https?:\/\//i).filter(Boolean);
  if (parts.length > 1) {
    return `Enter only one ${label.toLowerCase()}.`;
  }
  try {
    const u = new URL(value);
    if (!u.hostname) return `Enter a valid ${label.toLowerCase()}.`;
  } catch {
    return `Enter a valid ${label.toLowerCase()}.`;
  }
  return null;
}

export function validateVideoEmbedUrl(raw: string): string | null {
  const value = normalizeSingleUrlInput(raw);
  if (!value) return null;
  const base = validateSingleHttpUrl(value, { label: "Video URL" });
  if (base) return base;
  const lower = value.toLowerCase();
  const ok =
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo.com");
  if (!ok) {
    return "Use a YouTube or Vimeo link.";
  }
  return null;
}

/** Hostnames only — strips paths and rejects full URLs pasted as domains. */
export function parseDomainListInput(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .map((part) => {
      if (!part) return "";
      if (URL_PROTOCOL.test(part)) {
        try {
          return new URL(part).hostname.toLowerCase();
        } catch {
          return "";
        }
      }
      return part.replace(/^\/+|\/+$/g, "").split("/")[0]?.toLowerCase() ?? "";
    })
    .filter(Boolean);
}

export function formatDomainListForInput(domains: string[]): string {
  return domains.map((d) => d.trim()).filter(Boolean).join(", ");
}

export function validateDomainListInput(raw: string): string | null {
  const parts = raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const part of parts) {
    if (/\s/.test(part) && !part.includes(".")) {
      return "Use hostnames like example.com — one per comma.";
    }
    const host = parseDomainListInput(part)[0];
    if (!host) continue;
    if (host.includes(" ")) {
      return "Domains cannot contain spaces.";
    }
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(host)) {
      return `Invalid domain: ${part}`;
    }
  }
  return null;
}

export function clampIntegerString(
  raw: string,
  min: number,
  max: number,
): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const n = Math.min(max, Math.max(min, Number.parseInt(digits, 10)));
  return String(n);
}

export const FIELD_MAX = {
  shortLabel: 80,
  title: 120,
  message: 500,
  placeholder: 120,
  url: 2048,
  domainList: 2000,
} as const;
