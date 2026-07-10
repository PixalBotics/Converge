"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { publishAppToast } from "@/lib/notify";

type Props = {
  label: string;
  value: string;
  mono?: boolean;
};

export function CopyableField({ label, value, mono = true }: Props) {
  const theme = useTheme() as AppTheme;
  const app = theme.app;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      publishAppToast({ message: "Copied to clipboard.", variant: "success" });
    } catch {
      publishAppToast({ message: value, variant: "success" });
    }
  };

  return (
    <Box>
      <Typography variant="caption" sx={{ color: app.dashboard.textMuted, display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          p: 1.25,
          borderRadius: "10px",
          bgcolor: alpha(app.dashboard.accentBlue, theme.palette.mode === "light" ? 0.06 : 0.12),
          border: `1px solid ${app.dashboard.cardBorder}`,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            wordBreak: "break-all",
            color: app.text.primary,
            fontFamily: mono ? "monospace" : undefined,
            fontSize: mono ? 12 : undefined,
          }}
        >
          {value}
        </Typography>
        <Button size="small" variant="secondary" onClick={() => void handleCopy()}>
          Copy
        </Button>
      </Box>
    </Box>
  );
}
