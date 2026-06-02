import { alpha } from "@mui/material/styles";

/** MUI `alpha()` only accepts simple colors — not `linear-gradient(...)`. */
export function isSimpleCssColor(value: string): boolean {
  const v = value.trim();
  if (!v || /gradient/i.test(v)) return false;
  return /^(#[\da-f]{3,8}|rgba?\(|hsla?\(|color\()/i.test(v);
}

/** Like MUI `alpha`, but no-ops to a solid fallback when the input is a gradient or invalid. */
export function safeAlpha(color: string, opacity: number, fallback?: string): string {
  if (isSimpleCssColor(color)) return alpha(color, opacity);
  return fallback ?? `rgba(255, 255, 255, ${Math.min(1, Math.max(0, opacity * 0.12))})`;
}
