"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { EmailStatusChip } from "./EmailStatusChip";

/** Table cell: test status + optional API message. */
export function EmailTestStatusCell({
  status,
  testedAt,
  message,
}: {
  status?: "success" | "failed" | null;
  testedAt?: string | null;
  message?: string | null;
}) {
  const theme = useTheme() as AppTheme;

  if (!status) {
    return (
      <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
        —
      </Typography>
    );
  }

  const at = testedAt ? new Date(testedAt).toLocaleString() : null;
  const msg = message?.trim();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
        <EmailStatusChip
          active={status === "success"}
          activeLabel="Passed"
          inactiveLabel="Failed"
        />
        {at ? (
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
            {at}
          </Typography>
        ) : null}
      </Box>
      {msg ? (
        <Typography
          variant="small"
          sx={{
            color: status === "success" ? theme.palette.success.light : theme.palette.error.light,
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {msg}
        </Typography>
      ) : null}
    </Box>
  );
}
