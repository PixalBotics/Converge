"use client";

import { ThemeSwatchButtonRoot } from "./styles";

export type ThemeSwatchButtonProps = {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  ariaLabel: string;
  compact?: boolean;
  shape?: "tile" | "circle";
};

export function ThemeSwatchButton({
  children,
  selected,
  onClick,
  ariaLabel,
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
      {children}
    </ThemeSwatchButtonRoot>
  );
}
