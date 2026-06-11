import type { SxProps, Theme } from "@mui/material/styles";

/** Combine MUI `sx` fragments (MUI v7 strict typing rejects raw `sx={[a, b]}` arrays). */
export function mergeSx(
  ...parts: Array<SxProps<Theme> | undefined>
): SxProps<Theme> {
  return parts.filter((part): part is SxProps<Theme> => part != null) as SxProps<Theme>;
}
