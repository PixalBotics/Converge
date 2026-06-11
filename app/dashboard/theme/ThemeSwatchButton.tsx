"use client";

import { ThemeSwatchButtonRoot, ThemeSwatchFill } from "./styles/theme-customize.styled";

export type ThemeSwatchButtonProps = {
  selected: boolean;
  onClick: () => void;
  ariaLabel: string;
  /** CSS `background` for the inner preview (gradient or solid). */
  background: string;
  compact?: boolean;
  shape?: "tile" | "circle";
};

export function ThemeSwatchButton({
  selected,
  onClick,
  ariaLabel,
  background,
  compact,
  shape = "tile",
}: ThemeSwatchButtonProps) {
  return (
    <ThemeSwatchButtonRoot
      type="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      onClick={onClick}
      $selected={selected}
      $shape={shape}
      $compact={compact}
    >
      <ThemeSwatchFill $shape={shape} $background={background} />
    </ThemeSwatchButtonRoot>
  );
}
