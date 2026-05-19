/** Layout / hit-target sizes — tuned for touch + visibility (theme customize page). */
export const THEME_SWATCH = {
  tileRadius: "10px",
  tileCompactPx: 80,
  circlePx: 120,
  /** Outer ring (conic) = inner fill + 2× ring padding. */
  pickerRingPx: 120,
  pickerRingPaddingPx: 5,
  /** Palette icon inside the custom-color picker trigger. */
  pickerIconPx: 22,
  popoverSpectrumPx: 84,
} as const;
