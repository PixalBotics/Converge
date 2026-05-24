"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { emailTableCellTruncateSx } from "../styles/email-table.styles";

export function EmailTableTextCell({
  value,
  muted = false,
}: {
  value: string | null | undefined;
  muted?: boolean;
}) {
  const text = value?.trim() || "—";

  return (
    <Box
      component="span"
      title={text === "—" ? undefined : text}
      sx={
        [
          emailTableCellTruncateSx,
          muted ? { color: "inherit", opacity: 0.82 } : null,
        ] as SxProps<Theme>
      }
    >
      {text}
    </Box>
  );
}
