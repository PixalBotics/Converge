import type { SxProps, Theme } from "@mui/material/styles";

/** `0` or undefined = auto (natural media aspect ratio). */
export function resolveBannerMediaSx(
  heightPx: number | undefined,
  options?: { compact?: boolean; bgcolor?: string },
): SxProps<Theme> {
  const base = {
    width: "100%",
    display: "block" as const,
    ...(options?.bgcolor ? { bgcolor: options.bgcolor } : {}),
  };
  if (heightPx != null && heightPx > 0) {
    return { ...base, height: heightPx, objectFit: "cover" as const };
  }
  return {
    ...base,
    height: "auto",
    maxHeight: options?.compact ? 200 : 320,
    objectFit: "contain" as const,
  };
}

export function normalizeBannerHeightPx(raw: unknown): number {
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(200, Math.max(48, Math.round(n)));
}
