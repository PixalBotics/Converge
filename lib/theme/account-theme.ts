import { APPEARANCE_PRESETS } from "./appearance-presets";
import { normalizeHex } from "./custom-accent-theme";

export type AccountThemeResolution =
  | { kind: "preset"; id: string }
  | { kind: "custom"; hex: string };

function isValidHexInput(s: string): boolean {
  const t = s.trim();
  const withHash = t.startsWith("#") ? t : `#${t}`;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(withHash);
}

/**
 * Maps API `backgroundColor` (e.g. from `/auth/me` or login `user.theme`) to a dashboard preset or custom accent.
 */
export function resolveAppearanceFromAccountBackgroundColor(
  raw: string | null | undefined,
): AccountThemeResolution | null {
  if (raw == null || String(raw).trim() === "") return null;
  const trimmed = String(raw).trim();
  if (!isValidHexInput(trimmed)) return null;

  const hex = normalizeHex(trimmed);
  const presetMatch = APPEARANCE_PRESETS.find(
    (p) => p.previewBar.toLowerCase() === hex.toLowerCase(),
  );
  if (presetMatch) return { kind: "preset", id: presetMatch.id };
  return { kind: "custom", hex };
}
