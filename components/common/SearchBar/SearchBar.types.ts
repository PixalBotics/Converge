import type { SxProps, Theme } from "@mui/material/styles";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sx?: SxProps<Theme>;
}

