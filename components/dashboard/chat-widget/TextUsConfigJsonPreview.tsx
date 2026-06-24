"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { textUsSavedConfigPreview } from "@/lib/chat-widget/text-us-form-defaults";
import type { TextUsThemePreviewInput } from "@/lib/chat-widget/text-us-design-json";
import type { TextUsFormFieldDraft } from "@/lib/chat-widget/widgetDraft";

export function TextUsConfigJsonPreview({
  theme: themeInput,
  fields,
}: {
  theme: TextUsThemePreviewInput;
  fields: TextUsFormFieldDraft[];
}) {
  const theme = useTheme() as AppTheme;
  const json = useMemo(
    () =>
      JSON.stringify(
        textUsSavedConfigPreview({
          theme: themeInput,
          fields,
        }),
        null,
        2,
      ),
    [themeInput, fields],
  );

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        bgcolor: "rgba(0,0,0,0.2)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${theme.app.dashboard.cardBorder}` }}>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontWeight: 600 }}>
          Saved config preview (readable JSON)
        </Typography>
      </Box>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.5,
          fontSize: 11.5,
          lineHeight: 1.55,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color: theme.app.dashboard.textMuted,
          overflowX: "auto",
          maxHeight: 280,
        }}
      >
        {json}
      </Box>
    </Box>
  );
}
