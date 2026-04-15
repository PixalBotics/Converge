import type { MouseEvent } from "react";

/**
 * Updates CSS vars used by `textFieldStyles` moving glow. Call from `onMouseMove` on the same
 * element that receives `textFieldStyles` (e.g. MUI `TextField` root).
 */
export function applyOutlineFieldCursorPosition(event: MouseEvent<Element>) {
  const el = event.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--input-cursor-x", `${event.clientX - rect.left}px`);
  el.style.setProperty("--input-cursor-y", `${event.clientY - rect.top}px`);
}

/**
 * Resets cursor vars when the pointer leaves the field.
 */
export function resetOutlineFieldCursorPosition(event: MouseEvent<Element>) {
  const el = event.currentTarget as HTMLElement;
  el.style.setProperty("--input-cursor-x", "50%");
  el.style.setProperty("--input-cursor-y", "50%");
}

/** Spread onto any `TextField`/`OutlinedInput` that uses `textFieldStyles` for consistent glow. */
export const outlineFieldCursorEventProps = {
  onMouseMove: applyOutlineFieldCursorPosition,
  onMouseLeave: resetOutlineFieldCursorPosition,
};
