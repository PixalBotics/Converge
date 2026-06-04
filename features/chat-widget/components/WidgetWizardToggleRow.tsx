"use client";

import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";

export function WidgetWizardToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        py: 1,
        borderBottom: `1px solid ${theme.app.dashboard.cardBorder}`,
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="medium" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
          {label}
        </Typography>
        {description ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.25 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      <Switch
        checked={checked}
        onChange={(_, v) => onChange(v)}
        disabled={disabled}
        color="success"
        sx={{ mt: -0.25 }}
      />
    </Box>
  );
}
