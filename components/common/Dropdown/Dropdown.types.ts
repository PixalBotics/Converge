import type { SxProps, Theme } from "@mui/material/styles";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  /** Options to show. Can be string[] (label = value) or DropdownOption[] */
  options: string[] | DropdownOption[];
  /** Currently selected value (must match option value) */
  value: string;
  /** Called when user selects an option */
  onChange: (value: string) => void;
  /** Optional custom label to show on trigger (defaults to selected option's label) */
  triggerLabel?: string;
  /** Chevron or end icon (e.g. "▾") */
  endIcon?: React.ReactNode;
  /** Button root sx (e.g. pill style) */
  buttonSx?: SxProps<Theme>;
  /** Menu paper sx (dropdown panel styles) */
  menuPaperSx?: SxProps<Theme>;
  /** Button size */
  size?: "small" | "medium" | "large";
  /** Button variant */
  variant?: "outlined" | "contained" | "text";
  /** Id for menu (for a11y) */
  id?: string;
}
