import type { SxProps, Theme } from "@mui/material/styles";

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  /** Options to show. Can be string[] (label = value) or SegmentedControlOption[] */
  options: string[] | SegmentedControlOption[];
  /** Currently selected value (must match option value) */
  value: string;
  /** Called when selection changes */
  onChange: (value: string) => void;
  /** Visual variant: "default" (blue selected) or "secondary" (purple selected) */
  variant?: "default" | "secondary";
  /** Size of the control */
  size?: "small" | "medium";
  /** Optional sx for the root ToggleButtonGroup */
  sx?: SxProps<Theme>;
}
