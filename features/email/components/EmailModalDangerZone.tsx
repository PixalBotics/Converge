"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { EmailConfigModalDivider } from "../styles/email-configuration.styled";

export function EmailModalDangerZone({
  title = "Remove configuration",
  description = "This stops sending with these settings. You can configure again later.",
  buttonLabel,
  onRemove,
  removing = false,
  disabled = false,
}: {
  title?: string;
  description?: string;
  buttonLabel: string;
  onRemove: () => void;
  removing?: boolean;
  disabled?: boolean;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <>
      <EmailConfigModalDivider />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, alignItems: "flex-start" }}>
        <Typography variant="medium" fontWeight={600} sx={{ color: theme.app.text.primary }}>
          {title}
        </Typography>
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
          {description}
        </Typography>
        <Button
          type="button"
          variant="danger"
          size="small"
          onClick={onRemove}
          disabled={disabled || removing}
          sx={{ minWidth: 160 }}
        >
          {removing ? "Removing…" : buttonLabel}
        </Button>
      </Box>
    </>
  );
}
