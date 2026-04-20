import type { SxProps, Theme } from "@mui/material/styles";

export interface CalendarProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  id?: string;
  min?: string;
  max?: string;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
}
