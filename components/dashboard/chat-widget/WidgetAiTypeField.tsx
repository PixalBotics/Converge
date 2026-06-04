"use client";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  VISITOR_WIDGET_AI_FIELD_CAPTION,
  WIDGET_AI_TYPE_AGENT_NOTE,
} from "@/lib/ai/ai-role-copy";
import {
  WIDGET_AI_TYPE_OPTIONS,
  type WidgetAiType,
} from "@/lib/chat-widget/widget-ai-type";

export function WidgetAiTypeField({
  value,
  onChange,
  disabled = false,
}: {
  value: WidgetAiType;
  onChange: (next: WidgetAiType) => void;
  disabled?: boolean;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      <Typography variant="medium16" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
        AI type
      </Typography>
      <Typography variant="caption" sx={{ display: "block", color: theme.app.dashboard.textMuted, mb: 0.75 }}>
        {VISITOR_WIDGET_AI_FIELD_CAPTION}
      </Typography>
      <Typography
        variant="caption"
        sx={{ display: "block", color: theme.app.dashboard.textMuted, mb: 1, lineHeight: 1.45 }}
      >
        Shown when chat mode is Hybrid or AI only. Agent-only mode ignores AI type on the server.{" "}
        {WIDGET_AI_TYPE_AGENT_NOTE}
      </Typography>
      <FormControl component="fieldset" disabled={disabled} sx={{ width: "100%" }}>
        <RadioGroup
          value={value}
          onChange={(e) => onChange(e.target.value as WidgetAiType)}
        >
          {WIDGET_AI_TYPE_OPTIONS.map((opt) => (
            <Box key={opt.value} sx={{ mb: 0.75 }}>
              <FormControlLabel
                value={opt.value}
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
                    {opt.label}
                  </Typography>
                }
              />
              <Typography
                variant="body2"
                sx={{ display: "block", pl: 4.25, color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}
              >
                {opt.description}
              </Typography>
            </Box>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
}
