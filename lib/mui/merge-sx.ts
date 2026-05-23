import type { SxProps, Theme } from "@mui/material/styles";

/** Combine MUI `sx` fragments (MUI v7 strict typing rejects raw `sx={[a, b]}` arrays). */
export function mergeSx(...parts: SxProps<Theme>[]): SxProps<Theme> {
  return parts as SxProps<Theme>;
}
