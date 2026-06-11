"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export type UserTypeBadgeValue = "Internal" | "External" | "—";

type Props = {
  value: UserTypeBadgeValue | string | null | undefined;
};

export function UserTypeBadge({ value }: Props) {
  const theme = useTheme() as AppTheme;
  const label = value === "Internal" || value === "External" ? value : "—";
  const isInternal = label === "Internal";

  if (label === "—") {
    return (
      <Box component="span" sx={{ color: theme.app.dashboard.textMuted, fontSize: "0.875rem" }}>
        —
      </Box>
    );
  }

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        px: 1.5,
        py: 0.5,
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1.25,
        bgcolor: isInternal
          ? theme.palette.mode === "light"
            ? theme.app.dashboard.blueTintBg
            : "rgba(59, 130, 246, 0.28)"
          : theme.palette.mode === "light"
            ? theme.app.dashboard.pinkTintBg
            : "rgba(236, 72, 153, 0.24)",
        color: theme.palette.mode === "light" ? "#111827" : "#FFFFFF",
      }}
    >
      {label}
    </Box>
  );
}
