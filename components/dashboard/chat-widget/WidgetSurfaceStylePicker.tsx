"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import {
  WIDGET_LAUNCHER_STYLE_OPTIONS,
  type WidgetLauncherStyleId,
} from "@/lib/chat-widget/launcher-style";

export function WidgetSurfaceStylePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: WidgetLauncherStyleId;
  onChange: (style: WidgetLauncherStyleId) => void;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <Box>
      <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600, mb: 0.75 }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
          gap: 1,
        }}
      >
        {WIDGET_LAUNCHER_STYLE_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <Button
              key={opt.id}
              type="button"
              variant={selected ? "primary" : "secondary"}
              onClick={() => onChange(opt.id)}
              sx={{
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
                py: 1.25,
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ display: "block" }}>
                {opt.label}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1.3 }}>
                {opt.description}
              </Typography>
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}
