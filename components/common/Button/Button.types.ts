import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

export interface ButtonProps extends Omit<MuiButtonProps, "variant" | "size"> {
  children: React.ReactNode;
  /**
   * `primary` — main CTA (often paired with `gradientPrimaryButtonSx`).
   * `secondary` — dismiss / cancel / neutral second action.
   * `outlined` — low-emphasis bordered.
   * `danger` — destructive confirm (delete); uses `app.dashboard.accentRed`.
   */
  variant?: "primary" | "secondary" | "outlined" | "danger";
  /** Default matches existing pill CTAs; `compact` / `small` for toolbars and dense forms. */
  size?: "default" | "compact" | "small";
  fullWidth?: boolean;
  component?: React.ElementType;
  href?: string;
}
