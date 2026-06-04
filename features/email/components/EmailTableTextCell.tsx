"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { emailTableCellTruncateSx } from "../styles/email-table.styles";
import { mergeSx } from "@/lib/mui/merge-sx";

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
      sx={mergeSx(
        emailTableCellTruncateSx,
        muted ? { color: "inherit", opacity: 0.82 } : null,
      )}
    >
      {text}
    </Box>
  );
}
